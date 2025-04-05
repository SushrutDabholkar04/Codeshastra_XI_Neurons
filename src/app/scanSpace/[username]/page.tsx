'use client'
import { useState, useRef, useEffect } from 'react'

export default function ScanSpacePage() {
  const videoRef = useRef<HTMLImageElement>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [jsonData, setJsonData] = useState<any>(null)

  const handleStart = () => {
    const socket = new WebSocket('ws://localhost:8000/ws/scan')
    socket.binaryType = 'arraybuffer'

    socket.onmessage = (event) => {
      const blob = new Blob([event.data], { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      if (videoRef.current) {
        videoRef.current.src = url
      }
    }

    setWs(socket)
  }

  const handleEnd = async () => {
    if (ws) {
      ws.close()
    }

    await fetch('http://localhost:8000/api/stop-scan', {
      method: 'POST',
    })

    const response = await fetch('http://localhost:8000/api/scan-space')
    const data = await response.json()
    setJsonData(data)

    // Optional: POST to your Next.js API route
    await fetch('/api/scanSpace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Space Optimization Scan</h1>
      <div className="flex gap-4">
        <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded">Start</button>
        <button onClick={handleEnd} className="bg-red-600 text-white px-4 py-2 rounded">End</button>
      </div>
      <div className="mt-4">
        <img ref={videoRef} alt="Camera Feed" className="w-full max-w-md" />
      </div>
      {jsonData && (
        <pre className="mt-4 p-2 bg-gray-100 border rounded text-sm">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      )}
    </div>
  )
}
