from flask import Flask, Response, jsonify
import cv2
import threading
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

cap = None
streaming = False
frame = None
frame_lock = threading.Lock()
frame_thread = None
frame_thread_stop = threading.Event()


def capture_frames():
    global cap, frame
    while not frame_thread_stop.is_set():
        if cap is not None and cap.isOpened():
            success, img = cap.read()
            if success:
                with frame_lock:
                    frame = img
        time.sleep(0.03)


@app.route('/run-inventory', methods=['GET'])
def run_inventory():
    global cap, streaming, frame_thread, frame_thread_stop

    if streaming:
        print("📦 Inventory already running.")
        return jsonify({"status": "Already running"}), 200

    cap = cv2.VideoCapture(0)
    time.sleep(1)  # Let the cam warm up

    if not cap.isOpened():
        print("🚫 Failed to open camera.")
        return jsonify({"status": "Failed to open camera"}), 500

    frame_thread_stop.clear()
    frame_thread = threading.Thread(target=capture_frames)
    frame_thread.start()
    streaming = True
    print("📦 Inventory flow started and camera opened.")
    return jsonify({"status": "Inventory started"}), 200


def generate_frames():
    global frame
    while streaming:
        with frame_lock:
            if frame is None:
                continue
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03)


@app.route('/video_feed')
def video_feed():
    if not streaming:
        return "Stream not running", 400
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/stop-stream', methods=['GET'])
def stop_stream():
    global cap, streaming, frame_thread, frame_thread_stop

    streaming = False
    frame_thread_stop.set()

    if frame_thread is not None:
        frame_thread.join()
        frame_thread = None

    if cap is not None:
        cap.release()
        cap = None

    print("🛑 Camera released and streaming stopped.")
    return jsonify({"status": "Stream stopped"}), 200


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
