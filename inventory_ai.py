from ultralytics import YOLO
import cv2
import json
import sys
from collections import defaultdict
import google.generativeai as genai

# Gemini API Key
genai.configure(api_key="AIzaSyAfztULJ30fJyHq5EuYPZAHYuHsA2j-pCE")
gen_model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest")

# Load YOLOv8 model
model = YOLO("yolov8n-oiv7.pt")

# Human-related or irrelevant classes to ignore
IGNORE_CLASSES = {
    "person", "man", "woman", "boy", "girl", "people",
    "human face", "glasses", "backpack", "handbag", "tie",
    "umbrella", "hat", "cap"
}

# Start webcam
cap = cv2.VideoCapture(0)
before_img = None
after_img = None

print("Press 'b' to capture BEFORE inventory image")
print("Press 'a' to capture AFTER inventory image")
print("Press 'q' to quit and process")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Inventory Camera", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('b'):
        before_img = frame.copy()
        print("Captured BEFORE image")
    elif key == ord('a'):
        after_img = frame.copy()
        print("Captured AFTER image")
    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

if before_img is None or after_img is None:
    print("Please capture both BEFORE and AFTER images.")
    sys.exit()

# Detect objects
before_result = model(before_img)[0]
after_result = model(after_img)[0]

def extract_inventory(result, frame):
    counts = defaultdict(int)
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id].lower()
        conf = float(box.conf[0].item())

        if label in IGNORE_CLASSES:
            continue

        counts[label] += 1

        # Draw bounding box and label
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 165, 0), 2)
        cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 165, 0), 2)
    return dict(counts)

# Get counts and draw boxes
before_counts = extract_inventory(before_result, before_img)
after_counts = extract_inventory(after_result, after_img)

# Format output
before_output = {
    "items": list(before_counts.keys()),
    "number_of_items": [before_counts[i] for i in before_counts]
}
after_output = {
    "items": list(after_counts.keys()),
    "number_of_items": [after_counts[i] for i in after_counts]
}

print("\nBEFORE INVENTORY:")
print(json.dumps(before_output, indent=2))
print("\nAFTER INVENTORY:")
print(json.dumps(after_output, indent=2))

# Gemini Prompt
gemini_prompt = f"""
You are an inventory assistant.

Here is the AFTER snapshot of detected inventory with item names and counts:
{json.dumps(after_output, indent=2)}

If the count of any item is 1, suggest restocking. Otherwise, mention that stock is sufficient.

Give your suggestions in clear, readable points.
"""

response = gen_model.generate_content(gemini_prompt)
print("\nRestocking Suggestions:")
print(response.text)

# Show annotated frames
cv2.imshow("Before Inventory", before_img)
cv2.imshow("After Inventory", after_img)
cv2.waitKey(0)
cv2.destroyAllWindows()
