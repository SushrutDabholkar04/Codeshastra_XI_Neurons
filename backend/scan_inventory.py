from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import threading
import time
import json
from collections import defaultdict

app = Flask(__name__)
CORS(app)

model = YOLO("yolov8n-oiv7.pt")

cap = cv2.VideoCapture(0)
before_img = None
after_img = None
latest_frame = None

# Thread to constantly read from webcam
def stream_camera():
    global latest_frame
    while True:
        ret, frame = cap.read()
        if ret:
            latest_frame = frame
        time.sleep(0.03)

threading.Thread(target=stream_camera, daemon=True).start()

@app.route("/video_feed")
def video_feed():
    def generate():
        while True:
            if latest_frame is not None:
                _, buffer = cv2.imencode('.jpg', latest_frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(0.03)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/capture", methods=["POST"])
def capture():
    global before_img, after_img

    mode = request.json.get("mode")  # 'before' or 'after'

    if latest_frame is None:
        return jsonify({"error": "No frame captured"}), 400

    if mode == "before":
        before_img = latest_frame.copy()
        cv2.imwrite("before_inventory.jpg", before_img)
        return jsonify({"message": "Before image captured."})

    elif mode == "after":
        after_img = latest_frame.copy()
        cv2.imwrite("after_inventory.jpg", after_img)
        return jsonify({"message": "After image captured."})

    return jsonify({"error": "Invalid mode"}), 400

@app.route("/process", methods=["GET"])
def process():
    if before_img is None or after_img is None:
        return jsonify({"error": "Both images not captured"}), 400

    def extract_counts(result):
        counts = defaultdict(int)
        for box in result.boxes:
            cls_id = int(box.cls[0].item())
            label = model.names[cls_id]
            if label not in ignore_classes:
                counts[label] += 1
        return dict(counts)

    before_result = model(before_img)[0]
    after_result = model(after_img)[0]

    ignore_classes = {
        "Person", "Man", "Woman", "Boy", "Girl", "Human face", "Glasses", 
        "backpack", "handbag", "tie", "umbrella", "hat", "cap"
    }

    before_counts = extract_counts(before_result)
    after_counts = extract_counts(after_result)

    return jsonify({
        "before": before_counts,
        "after": after_counts
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
