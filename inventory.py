from ultralytics import YOLO
import cv2
import json
from collections import defaultdict
import sys


# Load YOLOv8 model
model = YOLO("yolov8n-oiv7.pt")  # Replace with your model if needed

# Open webcam
cap = cv2.VideoCapture(0)

before_img = None
after_img = None

print("📸 Press 'b' to capture BEFORE inventory image")
print("📸 Press 'a' to capture AFTER inventory image")
print("❌ Press 'q' to quit and process comparison")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    cv2.imshow("Live Camera Feed", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord('b'):
        before_img = frame.copy()
        cv2.imwrite("before_inventory.jpg", before_img)
        print("✅ BEFORE image captured!")

    elif key == ord('a'):
        after_img = frame.copy()
        cv2.imwrite("after_inventory.jpg", after_img)
        print("✅ AFTER image captured!")

    elif key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

if before_img is None or after_img is None:
    print("⚠️ Please capture both BEFORE and AFTER images.")
    sys.exit()

# Run YOLO detection
before_result = model(before_img)[0]
after_result = model(after_img)[0]

# Classes to ignore (people + human-associated items)
ignore_classes = {
    "Person", "Man", "Woman", "Boy", "Girl", "Human face", "Glasses", 
    "backpack", "handbag", "tie", "umbrella", "hat", "cap"
}

def extract_inventory_counts(result):
    counts = defaultdict(int)
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id]
        if label not in ignore_classes:
            counts[label] += 1
    return dict(counts)

def filter_inventory_result(result):
    # Draw only valid boxes
    valid_indices = [
        i for i, box in enumerate(result.boxes)
        if model.names[int(box.cls[0].item())] not in ignore_classes
    ]
    filtered_result = result
    filtered_result.boxes = result.boxes[valid_indices]
    return filtered_result

def format_inventory_output(counts):
    items = list(counts.keys())
    number_of_items = [counts[item] for item in items]
    return {
        "items": items,
        "number_of_items": number_of_items
    }

# Extract and format counts
before_counts = extract_inventory_counts(before_result)
after_counts = extract_inventory_counts(after_result)

before_output = format_inventory_output(before_counts) #required
after_output = format_inventory_output(after_counts) #required

final_before_required = json.dumps(before_output, indent=2)
final_after_required = json.dumps(after_output, indent=2)
# Print as JSON
print("\n📦 BEFORE INVENTORY:")
print(final_before_required)

print("\n📦 AFTER INVENTORY:")
print(final_after_required)

# Filter results for visualization
filtered_before = filter_inventory_result(before_result)
filtered_after = filter_inventory_result(after_result)

# Show the annotated frames
cv2.imshow("Before Inventory (Filtered)", filtered_before.plot())
cv2.imshow("After Inventory (Filtered)", filtered_after.plot())
cv2.waitKey(0)
cv2.destroyAllWindows()
