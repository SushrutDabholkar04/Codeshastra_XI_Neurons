'use client'

import { useState } from 'react'

export default function ScanSecurityPage() {
  const [started, setStarted] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleStart = async () => {
    await fetch('http://127.0.0.1:5000/start')
    setStarted(true)
  }

  const handleEnd = async () => {
    const res = await fetch('http://127.0.0.1:5000/stop')
    const data = await res.json()
    setResult(data)

    await fetch('/api/scanSecurity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    setStarted(false)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4">
        <button
          onClick={handleStart}
          disabled={started}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={handleEnd}
          disabled={!started}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          End
        </button>
      </div>

      {started && (
        <div>
          <h2 className="text-lg font-semibold mt-4">Live Camera Feed:</h2>
          <img
            src="http://127.0.0.1:5000/video_feed"
            alt="Live feed"
            className="mt-2 rounded border w-[600px]"
          />
        </div>
      )}

      {result && (
        <div>
          <h2 className="text-lg font-semibold mt-4">Detection Result:</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
