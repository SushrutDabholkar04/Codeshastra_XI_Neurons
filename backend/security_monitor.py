from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import threading
import time
import json
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model
model = YOLO("yolov8n-oiv7.pt")
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)  # Use CAP_DSHOW for Windows stability

special_person_classes = {"Person", "Man", "Woman", "Boy", "Girl", "Human face"}
prev_state = {}
last_update = time.time()
json_result = {}
running = False

def extract_object_info(result):
    detected = {}
    clothing_keywords = {"clothing","shirt", "t-shirt", "pants", "jeans", "jacket", "sweater", "hoodie", "shorts", "dress", "skirt", "coat", "uniform"}

    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id].lower()

        # Skip if the label contains clothing-related words
        if any(cloth in label for cloth in clothing_keywords):
            continue

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
            status[label] = "person detected"
            continue
        prev_positions = prev.get(label, [])
        curr_positions = current.get(label, [])
        if not prev_positions and curr_positions:
            status[label] = "added"
        elif prev_positions and not curr_positions:
            status[label] = "removed"
        elif prev_positions and curr_positions:
            movement = any(
                np.linalg.norm(np.array(p) - np.array(c)) > threshold
                for p in prev_positions for c in curr_positions
            )
            status[label] = "repositioned" if movement else "unchanged"
    return status

def monitor():
    global prev_state, last_update, json_result, running
    while running:
        ret, frame = cap.read()
        if not ret:
            continue
        if time.time() - last_update >= 5:
            result = model(frame)[0]
            curr_state = extract_object_info(result)
            diff = compare_objects(prev_state, curr_state)
            json_result = {
                "item": list(diff.keys()),
                "status_or_position": list(diff.values())
            }
            prev_state = curr_state
            last_update = time.time()
        time.sleep(0.1)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/start', methods=['GET'])
def start_monitoring():
    global running
    print("✅ /start called")
    if not running:
        running = True
        threading.Thread(target=monitor).start()
    return "Monitoring started"

@app.route('/stop', methods=['GET'])
def stop_monitoring():
    global running
    running = False
    print("🛑 /stop called")
    return jsonify(json_result)

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(port=5000)