# backend/space_optimization_server.py
from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import json
import asyncio
from ultralytics import YOLO

app = FastAPI()
model = YOLO("yolov8n-oiv7.pt")

capture = False
frame_result = None

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/scan")
async def scan_socket(websocket: WebSocket):
    global capture, frame_result
    await websocket.accept()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        await websocket.send_text("❌ Camera not accessible.")
        await websocket.close()
        return

    capture = True
    while capture:
        ret, frame = cap.read()
        if not ret:
            break

        _, buffer = cv2.imencode('.jpg', frame)
        await websocket.send_bytes(buffer.tobytes())
        await asyncio.sleep(0.05)

    cap.release()
    await websocket.close()

@app.get("/api/scan-space")
def scan_and_analyze():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    if not ret:
        return JSONResponse({"error": "Camera not accessible"}, status_code=500)

    cap.release()
    result = model(frame)[0]

    ignore_classes = {
        "Person", "Man", "Woman", "Boy", "Girl", "Human face", "Glasses",
        "backpack", "handbag", "tie", "umbrella", "hat", "cap"
    }

    img_h, img_w, _ = frame.shape
    objects = []

    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        label = model.names[cls_id]
        if label in ignore_classes:
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        center_x = (x1 + x2) // 2

        objects.append({
            "label": label,
            "x1": x1,
            "x2": x2,
            "center_x": center_x
        })

    objects.sort(key=lambda x: x["center_x"])
    items = []
    suggestions = []

    for i, obj in enumerate(objects):
        x1, x2 = obj["x1"], obj["x2"]
        left_gap = obj["x1"] if i == 0 else obj["x1"] - objects[i - 1]["x2"]
        right_gap = (img_w - obj["x2"]) if i == len(objects) - 1 else objects[i + 1]["x1"] - obj["x2"]

        has_left_space = left_gap > 50
        has_right_space = right_gap > 50

        if has_left_space and has_right_space:
            suggestion = "empty space on both sides, can move to any side"
        elif has_left_space:
            suggestion = "empty space on left, can move left"
        elif has_right_space:
            suggestion = "empty space on right, can move right"
        else:
            suggestion = "no significant empty space around"

        items.append(obj["label"])
        suggestions.append(suggestion)

    return {
        "items": items,
        "suggestions": suggestions
    }

@app.post("/api/stop-scan")
def stop_scan():
    global capture
    capture = False
    return {"message": "Camera stopped."}
