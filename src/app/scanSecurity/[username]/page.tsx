"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Play, Square, AlertTriangle, Plus, Minus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SecurityLog {
  _id: string
  items: string[] // Changed from item to items
  status_or_position: string[]
  timestamp: string // Changed from createdAt to timestamp
}

export default function ScanSecurityPage() {
  const [started, setStarted] = useState(false)
  const [recentLog, setRecentLog] = useState<SecurityLog | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch most recent log
  const fetchRecentLog = async () => {
    try {
      const res = await fetch("/api/scanSecurity")
      const data = await res.json()
      if (data.success && data.logs && data.logs.length > 0) {
        // Get the most recent log (assuming logs are sorted by timestamp)
        setRecentLog(data.logs[0])
      }
    } catch (error) {
      console.error("Error fetching log:", error)
    }
  }

  // Start polling when scanning starts
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (started) {
      // Initial fetch
      fetchRecentLog()

      // Set up polling every 5 seconds
      interval = setInterval(fetchRecentLog, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [started])

  const handleStart = async () => {
    setLoading(true)
    try {
      await fetch("http://127.0.0.1:5000/start")
      setStarted(true)
      // Fetch log immediately after starting
      fetchRecentLog()
    } catch (error) {
      console.error("Error starting scan:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnd = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:5000/stop")
      const data = await res.json()

      await fetch("/api/scanSecurity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      // Fetch log one final time
      fetchRecentLog()
    } catch (error) {
      console.error("Error stopping scan:", error)
    } finally {
      setStarted(false)
      setLoading(false)
    }
  }

  // Helper function to get alert variant based on status
  const getAlertVariant = (status: string) => {
    if (status.includes("added")) return "success"
    if (status.includes("removed")) return "destructive"
    return "warning"
  }

  // Helper function to get icon based on status
  const getStatusIcon = (status: string) => {
    if (status.includes("added")) return <Plus className="h-4 w-4" />
    if (status.includes("removed")) return <Minus className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Security Monitoring System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={handleStart} disabled={started || loading} className="gap-2" variant="default">
                <Play className="h-4 w-4" />
                Start Monitoring
              </Button>
              <Button onClick={handleEnd} disabled={!started || loading} className="gap-2" variant="destructive">
                <Square className="h-4 w-4" />
                Stop Monitoring
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Camera Feed Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Live Camera Feed</h2>
                {started ? (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img src="http://127.0.0.1:5000/video_feed" alt="Live feed" className="w-full h-auto" />
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg flex items-center justify-center h-[300px]">
                    <div className="text-center text-muted-foreground">
                      <AlertTriangle className="mx-auto h-12 w-12 mb-2" />
                      <p>Camera feed will appear when monitoring starts</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Most Recent Alert Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Most Recent Alert</h2>
                  <Button variant="outline" size="sm" onClick={fetchRecentLog} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                <div>
                  {recentLog ? (
                    <Card className="overflow-hidden">
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm font-medium">
                            Alert at {formatTime(recentLog.timestamp)}
                          </CardTitle>
                          <Badge variant="outline">{new Date(recentLog.timestamp).toLocaleDateString()}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 space-y-2">
                        {recentLog.items &&
                          recentLog.items.map((item, index) => {
                            const status = recentLog.status_or_position[index] || "unknown"
                            return (
                              <Alert
                                key={`${recentLog._id}-${index}`}
                                variant={getAlertVariant(status) as any}
                                className="py-3"
                              >
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status)}
                                  <AlertTitle className="text-sm font-medium">
                                    {item} : {status}
                                  </AlertTitle>
                                </div>
                                <AlertDescription className="text-xs mt-1">
                                {item} is {status}
                                </AlertDescription>
                              </Alert>
                            )
                          })}
                      </CardContent>
                    </Card>
                  ) : started ? (
                    // Show skeleton when loading
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-6">
                        <div className="text-center text-muted-foreground">
                          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                          <p>No alerts to display. Start monitoring to see alerts.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

