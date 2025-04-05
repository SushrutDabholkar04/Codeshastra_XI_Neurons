'use client';
import { useEffect, useRef, useState } from 'react';

export default function ScanInventoryPage() {
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState<any>(null);
  const videoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = 'http://localhost:5001/video_feed';
    }
  }, []);

  const capture = async (mode: 'before' | 'after') => {
    const res = await fetch('http://localhost:5001/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  const process = async () => {
    const res = await fetch('/api/scanInventory'); // Hits route.ts
    const data = await res.json();
    setOutput(data);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">📦 Inventory Scanner</h1>

      <img ref={videoRef} className="w-full max-w-lg border rounded" />

      <div className="space-x-2">
        <button onClick={() => capture('before')} className="btn">Capture Before</button>
        <button onClick={() => capture('after')} className="btn">Capture After</button>
        <button onClick={process} className="btn bg-green-600 text-white">Process</button>
      </div>

      <p>{message}</p>

      {output && (
        <div className="mt-4">
          <h2 className="font-semibold">Before:</h2>
          <pre>{JSON.stringify(output.before, null, 2)}</pre>
          <h2 className="font-semibold">After:</h2>
          <pre>{JSON.stringify(output.after, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
