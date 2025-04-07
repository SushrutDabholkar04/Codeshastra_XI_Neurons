from ultralytics import YOLO
import cv2
import json
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key="AIzaSyAfztULJ30fJyHq5EuYPZAHYuHsA2j-pCE")

# Load YOLOv8 model
model = YOLO("yolov8n-oiv7.pt")

# Set of human-related classes to exclude (all lowercase)
HUMAN_CLASSES = {"man", "woman", "person", "person wearing glasses", "people", "human face", "human","clothing"}

# Open webcam (use 0 or 1 depending on your device)
cap = cv2.VideoCapture(0)

print("Live camera started.")
print("Press 's' to scan the frame for space optimization.")
print("Press 'q' to quit.")

frame = None

# Capture frame
while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture video feed.")
        break

    cv2.imshow("Camera Feed", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('s'):
        print("Scanning current frame...")
        break
    elif key == ord('q'):
        cap.release()
        cv2.destroyAllWindows()
        exit()

cap.release()
cv2.destroyAllWindows()

# Run YOLO model
result = model(frame)[0]
min_conf = 0.25
img_h, img_w, _ = frame.shape
objects = []

# Filter and draw boxes
for box in result.boxes:
    cls_id = int(box.cls[0].item())
    label = model.names[cls_id]
    conf = float(box.conf[0].item())

    if conf < min_conf or label.lower() in HUMAN_CLASSES:
        continue

    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
    center_x = (x1 + x2) // 2

    # Draw bounding box and label
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    objects.append({
        "label": label,
        "confidence": round(conf, 2),
        "x1": x1,
        "x2": x2,
        "center_x": center_x
    })

# Sort objects left to right
objects.sort(key=lambda x: x["center_x"])

items = []
suggestions = []

# Analyze spacing
for i, obj in enumerate(objects):
    label = obj["label"]
    x1, x2 = obj["x1"], obj["x2"]

    left_gap = x1 if i == 0 else x1 - objects[i - 1]["x2"]
    right_gap = (img_w - x2) if i == len(objects) - 1 else objects[i + 1]["x1"] - x2

    has_left_space = left_gap > 50
    has_right_space = right_gap > 50

    if has_left_space and has_right_space:
        suggestion = "Item has space on both sides — can move left or right"
    elif has_left_space:
        suggestion = "Item has space on the left — consider shifting left"
    elif has_right_space:
        suggestion = "Item has space on the right — consider shifting right"
    else:
        suggestion = "No significant space around — placement is tight"

    items.append({
        "label": label,
        "confidence": obj["confidence"]
    })
    suggestions.append({
        "label": label,
        "suggestion": suggestion
    })

output = {
    "detected_items": items,
    "space_suggestions": suggestions
}

print("\nSpace Optimization Output:")
print(json.dumps(output, indent=2))

# Generate Gemini-based layout suggestion
gen_model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")

prompt = f"""
You are a visual layout optimization assistant.

Here is the list of objects detected in an image, excluding people, with their confidence scores and spacing suggestions:

Detected Objects with Confidence:
{json.dumps(items, indent=2)}

Space Suggestions per Object:
{json.dumps(suggestions, indent=2)}

Analyze the layout and suggest ways to better organize these objects spatially. Recommend shifting if gaps are available. Only use the information provided — no external assumptions.
"""

response = gen_model.generate_content(prompt)

print("\nSuggestions:")
print(response.text)

# Show final output
cv2.imshow("Scanned Frame with Object Detection", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()
