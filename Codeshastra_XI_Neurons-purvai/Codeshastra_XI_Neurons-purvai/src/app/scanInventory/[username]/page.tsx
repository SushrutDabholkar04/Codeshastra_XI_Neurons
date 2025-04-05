'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const InventoryScanner = () => {
  const [feedActive, setFeedActive] = useState(false);
  const [capturedBefore, setCapturedBefore] = useState(false);
  const [capturedAfter, setCapturedAfter] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const startFeed = async () => {
    try {
      setLoadingFeed(true);
      await fetch('http://localhost:5001/run-inventory');
      setTimeout(() => {
        setFeedActive(true);
        setLoadingFeed(false);
      }, 1000);
    } catch (err) {
      alert('❌ Failed to start camera: ' + err);
      setLoadingFeed(false);
    }
  };

  const stopFeed = async () => {
    await fetch('http://localhost:5001/stop-stream');
    setFeedActive(false);
    setCapturedBefore(false);
    setCapturedAfter(false);
  };

  const captureImage = async (type: 'before' | 'after') => {
    const res = await fetch(`http://localhost:5001/capture-${type}`);
    if (res.ok) {
      if (type === 'before') setCapturedBefore(true);
      else setCapturedAfter(true);
    } else {
      alert(`❌ Failed to capture ${type} image.`);
    }
  };

  return (
    <main className="min-h-screen p-10 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Inventory Scanner</h1>

      {!feedActive && !loadingFeed && (
        <Button onClick={startFeed}>Start Camera Feed</Button>
      )}

      {loadingFeed && <p>Starting camera feed...</p>}

      {feedActive && (
        <>
          <img
            src={`http://localhost:5001/video_feed?${Date.now()}`}
            alt="Inventory Feed"
            className="rounded-xl border shadow-lg w-[640px] h-[480px] mb-4"
          />
          <div className="flex gap-4">
            <Button
              onClick={() => captureImage('before')}
              disabled={capturedBefore}
            >
              {capturedBefore ? '✅ Before Captured' : 'Capture Before'}
            </Button>
            <Button
              onClick={() => captureImage('after')}
              disabled={capturedAfter}
            >
              {capturedAfter ? '✅ After Captured' : 'Capture After'}
            </Button>
            <Button variant="destructive" onClick={stopFeed}>
              Stop Feed
            </Button>
          </div>
        </>
      )}
    </main>
  );
};

export default InventoryScanner;
