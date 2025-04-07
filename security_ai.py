import cv2
import time
import json
import numpy as np
from ultralytics import YOLO
import google.generativeai as genai

# 🔑 Gemini API Key
genai.configure(api_key="AIzaSyAfztULJ30fJyHq5EuYPZAHYuHsA2j-pCE")

# Load YOLOv8 model
model = YOLO("yolov8n-oiv7.pt")
cap = cv2.VideoCapture(0)

# ✅ Convert all human-related classes to lowercase for consistent checking
HUMAN_CLASSES = {cls.lower() for cls in {
    "person", "man", "woman", "boy", "girl", "people", "human face", "person wearing glasses"
}}

def extract_object_info(result, frame):
    detected = {}
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id]
        conf = float(box.conf[0].item())
        if label.lower() in HUMAN_CLASSES:
            continue  # Skip humans for inventory analysis

        xyxy = box.xyxy[0].cpu().numpy().astype(int)
        center = ((xyxy[0] + xyxy[2]) / 2, (xyxy[1] + xyxy[3]) / 2)

        # Draw bounding boxes and labels
        cv2.rectangle(frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), (0, 255, 0), 2)
        cv2.putText(frame, f"{label} {conf:.2f}", (xyxy[0], xyxy[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        detected.setdefault(label, []).append(center)
    return detected

def detect_humans(result):
    # Separate human detection for security alerting
    humans_detected = []
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id]
        if label.lower() in HUMAN_CLASSES:
            humans_detected.append(label)
    return humans_detected

def compare_objects(prev, current, threshold=50):
    status = {}
    all_labels = set(prev.keys()) | set(current.keys())

    for label in all_labels:
        prev_positions = prev.get(label, [])
        curr_positions = current.get(label, [])

        if not prev_positions and curr_positions:
            status[label] = "added"
        elif prev_positions and not curr_positions:
            status[label] = "removed"
        elif prev_positions and curr_positions:
            moved = any(
                np.linalg.norm(np.array(p) - np.array(c)) > threshold
                for p in prev_positions for c in curr_positions
            )
            status[label] = "repositioned" if moved else "unchanged"
    return status

prev_state = {}
last_update = time.time()

print("📹 Smart Security Monitoring Started. Press 'q' to quit.")

gen_model = genai.GenerativeModel("gemini-1.5-pro-latest")  # Init Gemini model once

while True:
    ret, frame = cap.read()
    if not ret:
        break

    current_time = time.time()
    if current_time - last_update >= 5:
        result = model(frame)[0]
        humans = detect_humans(result)
        curr_state = extract_object_info(result, frame)
        diff = compare_objects(prev_state, curr_state)

        json_result = {
            "item": list(diff.keys()),
            "status": list(diff.values()),
            "humans_detected": list(set(humans))
        }

        print("\n🔍 Detected Changes:")
        print(json.dumps(json_result, indent=2))

        # Gemini Prompt
        prompt = f"""
You are a smart surveillance assistant.

Here are the detected changes between two frames captured 5 seconds apart:

{json.dumps(json_result, indent=2)}

Generate a short and clear security alert. Highlight if a person was detected or if any item was added, removed, or repositioned.
"""

        try:
            response = gen_model.generate_content(prompt)
            print("\n⚠️ Alert:")
            print(response.text.strip())
        except Exception as e:
            print("❌ Gemini Error:", e)

        prev_state = curr_state
        last_update = current_time

    cv2.imshow("🔒 Security Camera Feed", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
