"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, StopCircle, Play, RefreshCw } from "lucide-react"
import { useParams } from "next/navigation"

export default function ScanSpacePage() {
  const videoRef = useRef<HTMLImageElement>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [items, setItems] = useState<string[]>([])
  const [formattedSuggestions, setFormattedSuggestions] = useState<string>("")
  const params = useParams()
  const username = params.username

  // Fetch the most recent scan data
  const fetchLatestScan = async () => {
    try {
      const response = await fetch("/api/scanSpace/latest")
      if (response.ok) {
        const data = await response.json()
        if (data.suggestions && data.items) {
          setSuggestions(data.suggestions)
          setItems(data.items)
          if (data.formattedSuggestions) {
            setFormattedSuggestions(data.formattedSuggestions)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching latest scan:", error)
    }
  }

  // Load the latest scan data on component mount
  useEffect(() => {
    fetchLatestScan()
  }, [])

  const handleStart = () => {
    setIsScanning(true)
    const socket = new WebSocket("ws://localhost:8000/ws/scan")
    socket.binaryType = "arraybuffer"

    socket.onopen = () => {
      console.log("WebSocket connection established")
    }

    socket.onmessage = (event) => {
      const blob = new Blob([event.data], { type: "image/jpeg" })
      const url = URL.createObjectURL(blob)
      if (videoRef.current) {
        videoRef.current.src = url
      }
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsScanning(false)
    }

    socket.onclose = () => {
      console.log("WebSocket connection closed")
      setIsScanning(false)
    }

    setWs(socket)
  }

  const handleEnd = async () => {
    setIsLoading(true)

    if (ws) {
      ws.close()
    }

    setIsScanning(false)

    try {
      // Stop the scan on the backend
      await fetch("http://localhost:8000/api/stop-scan", {
        method: "POST",
      })

      // Get the scan results
      const response = await fetch("http://localhost:8000/api/scan-space")
      const data = await response.json()

      if (data.items && data.suggestions) {
        setItems(data.items)
        setSuggestions(data.suggestions)

        // Send data to our Next.js API for processing with Gemini and storage
        const apiResponse = await fetch("/api/scanSpace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const apiData = await apiResponse.json()

        if (apiData.formattedSuggestions) {
          setFormattedSuggestions(apiData.formattedSuggestions)
        }
      }
    } catch (error) {
      console.error("Error ending scan:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Space Optimization Scanner</h1>
          </div>
          <p className="text-gray-600">
            Welcome, <span className="font-medium">{username}</span>. Scan your space to receive optimization
            suggestions.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                {!isScanning && !videoRef.current?.src && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg opacity-75">Camera feed will appear here</p>
                    <p className="text-sm opacity-50 mt-2">Click Start to begin scanning</p>
                  </div>
                )}
                <img ref={videoRef} alt="Camera Feed" className="w-full h-full object-contain" />
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-10 w-10 text-white animate-spin" />
                      <p className="text-white mt-4">Processing scan...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 flex gap-4 justify-center">
                <button
                  onClick={handleStart}
                  disabled={isScanning || isLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isScanning
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Play className="h-5 w-5" />
                  Start Scan
                </button>

                <button
                  onClick={handleEnd}
                  disabled={!isScanning || isLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !isScanning
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <StopCircle className="h-5 w-5" />
                  End Scan
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Detected Items</h2>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Optimization Suggestions
              </h2>

              {formattedSuggestions ? (
                <div className="prose prose-blue max-w-none">
                  {formattedSuggestions.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">
                        {items[index]}: {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No suggestions available yet.</p>
                  <p className="text-sm mt-2">Complete a scan to receive optimization suggestions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

