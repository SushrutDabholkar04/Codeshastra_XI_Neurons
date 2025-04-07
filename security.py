import cv2
import time
import json
from ultralytics import YOLO
import numpy as np

# Load YOLOv8 model
model = YOLO("yolov8n-oiv7.pt")
cap = cv2.VideoCapture(0)

# Special classes we will mark as "person detected"
special_person_classes = {
    "Person", "Man", "Woman", "Boy", "Girl", "Human face"
}

def extract_object_info(result):
    detected = {}
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id]
        xyxy = box.xyxy[0].cpu().numpy()
        center = ((xyxy[0] + xyxy[2]) / 2, (xyxy[1] + xyxy[3]) / 2)
        if label not in detected:
            detected[label] = []
        detected[label].append(center)
    return detected

def compare_objects(prev, current, threshold=50):
    status = {}
    all_labels = set(prev.keys()) | set(current.keys())

    for label in all_labels:
        if label in special_person_classes:
            # Person detected (special case)
            status[label] = "person detected"
            continue

        prev_positions = prev.get(label, [])
        curr_positions = current.get(label, [])

        if not prev_positions and curr_positions:
            status[label] = "added"
        elif prev_positions and not curr_positions:
            status[label] = "removed"
        elif prev_positions and curr_positions:
            # Compare positions
            movement = any(
                np.linalg.norm(np.array(p) - np.array(c)) > threshold
                for p in prev_positions for c in curr_positions
            )
            status[label] = "repositioned" if movement else "unchanged"
    return status

prev_state = {}
last_update = time.time()

print("🛡️ Starting security monitoring... Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    current_time = time.time()
    if current_time - last_update >= 5:
        result = model(frame)[0]
        curr_state = extract_object_info(result)
        diff = compare_objects(prev_state, curr_state)
        
        json_result = {
            "item": list(diff.keys()),
            "status": list(diff.values())
        }

        print(json.dumps(json_result, indent=2))
        prev_state = curr_state
        last_update = current_time

    cv2.imshow("Security Camera", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()