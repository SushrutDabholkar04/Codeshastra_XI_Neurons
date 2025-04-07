from ultralytics import YOLO
import cv2
import json

# Load YOLOv8 model (can also try 'yolov8m.pt' for better results)
model = YOLO("yolov8n-oiv7.pt")

# Open webcam
cap = cv2.VideoCapture(0)

print("📹 Live Camera Started")
print("➡ Press 's' to scan the frame for space optimization")
print("❌ Press 'q' to quit without scanning")

frame = None

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to capture video feed.")
        break

    cv2.imshow("Live Camera - Press 's' to Scan", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('s'):
        print("📸 Frame captured for analysis...")
        break
    elif key == ord('q'):
        print("👋 Quit without scanning.")
        cap.release()
        cv2.destroyAllWindows()
        exit()

cap.release()
cv2.destroyAllWindows()

# Run object detection on the captured frame
results = model(frame)[0]

# Set confidence threshold
min_conf = 0.25

img_h, img_w, _ = frame.shape
detected_objects = []

# Process detections
for box in results.boxes:
    cls_id = int(box.cls[0].item())
    label = model.names[cls_id]
    conf = float(box.conf[0].item())

    if conf < min_conf:
        continue

    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
    center_x = (x1 + x2) // 2

    # Draw bounding box and label
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(
        frame, f"{label} {conf:.2f}", (x1, y1 - 10),
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
    )

    detected_objects.append({
        "label": label,
        "confidence": round(conf, 2),
        "x1": x1,
        "x2": x2,
        "center_x": center_x
    })

# Sort objects by horizontal center
detected_objects.sort(key=lambda obj: obj["center_x"])

# Analyze spacing and suggest optimization
items = []
suggestions = []

for i, obj in enumerate(detected_objects):
    label = obj["label"]
    x1, x2 = obj["x1"], obj["x2"]

    # Calculate space to the left and right
    left_gap = x1 if i == 0 else x1 - detected_objects[i - 1]["x2"]
    right_gap = (img_w - x2) if i == len(detected_objects) - 1 else detected_objects[i + 1]["x1"] - x2

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

# Prepare JSON output
output = {
    "detected_items": items,
    "space_suggestions": suggestions
}

print("\n📦 Smart Space Optimization Output:")
print(json.dumps(output, indent=2))

# Show the result
cv2.imshow("Scanned Frame with Object Detection", frame)
cv2.waitKey(0)
cv2.destroyAllWindows()
