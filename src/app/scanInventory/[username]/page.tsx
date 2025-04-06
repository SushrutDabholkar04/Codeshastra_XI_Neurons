"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Loader2, MinusCircle, Package, PlusCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

type InventoryItem = {
  items: string[]
  number_of_items: number[]
}

type InventoryData = {
  before: InventoryItem
  after: InventoryItem
}

type ItemComparison = {
  name: string
  beforeCount: number
  afterCount: number
  difference: number
}

export default function ScanInventoryPage() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scanStage, setScanStage] = useState<"idle" | "before" | "after">("idle")
  const [output, setOutput] = useState<InventoryData | null>(null)
  const [comparison, setComparison] = useState<ItemComparison[]>([])
  const videoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = "http://localhost:5001/video_feed"
    }
  }, [])

  useEffect(() => {
    if (output) {
      generateComparison()
    }
  }, [output])

  const generateComparison = () => {
    if (!output) return

    const allItems = new Set([...output.before.items, ...output.after.items])

    const comparisonData: ItemComparison[] = []

    allItems.forEach((item) => {
      const beforeIndex = output.before.items.indexOf(item)
      const afterIndex = output.after.items.indexOf(item)

      const beforeCount = beforeIndex >= 0 ? output.before.number_of_items[beforeIndex] : 0
      const afterCount = afterIndex >= 0 ? output.after.number_of_items[afterIndex] : 0

      comparisonData.push({
        name: item,
        beforeCount,
        afterCount,
        difference: afterCount - beforeCount,
      })
    })

    // Sort by absolute difference (largest changes first)
    comparisonData.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))

    setComparison(comparisonData)
  }

  const capture = async (mode: "before" | "after") => {
    try {
      setIsLoading(true)
      setMessage(`Capturing ${mode} inventory...`)

      const res = await fetch("http://localhost:5001/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      })

      const data = await res.json()
      setMessage(data.message || data.error)

      if (mode === "before") {
        setScanStage("before")
        setOutput(null)
      } else if (mode === "after") {
        setScanStage("after")
        // Automatically fetch the processed data after capturing "after" image
        await fetchInventoryData()
      }
    } catch (error) {
      setMessage("Error capturing image")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true)
      setMessage("Processing inventory data...")

      const res = await fetch("/api/scanInventory")
      const data = await res.json()

      if (data.error) {
        setMessage(data.error)
        return
      }

      setOutput(data)
      setMessage("Inventory scan complete!")
    } catch (error) {
      setMessage("Error processing inventory data")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetScan = () => {
    setScanStage("idle")
    setOutput(null)
    setComparison([])
    setMessage("")
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Camera and Controls */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              Inventory Scanner
            </h1>
            {scanStage !== "idle" && (
              <Button variant="outline" size="sm" onClick={resetScan} className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          <Card className="overflow-hidden">
            <div className="relative">
              <img ref={videoRef} className="w-full aspect-video object-cover" alt="Camera feed" />
              <div className="absolute top-2 right-2">
                <Badge variant={scanStage === "idle" ? "outline" : "default"} className="bg-opacity-75">
                  {scanStage === "idle"
                    ? "Ready to scan"
                    : scanStage === "before"
                      ? "Before image captured"
                      : "Scan complete"}
                </Badge>
              </div>
            </div>
          </Card>

          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => capture("before")}
                disabled={isLoading}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading && scanStage === "idle" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-2">📷</span>
                )}
                Start Scan
              </Button>

              <Button
                onClick={() => capture("after")}
                disabled={isLoading || scanStage === "idle"}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading && scanStage === "before" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-2">🔍</span>
                )}
                End Scan
              </Button>
            </div>

            {message && (
              <div
                className={cn(
                  "p-3 rounded-md text-sm",
                  isLoading ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {message}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="w-full md:w-1/2">
          <Card className="h-full">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Inventory Results</h2>

              {!output ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-500">
                  <Package className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No inventory data yet</p>
                  <p className="text-sm mt-2">
                    {scanStage === "idle"
                      ? 'Click "Start Scan" to begin capturing inventory'
                      : 'Click "End Scan" to complete the inventory process'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Tabs defaultValue="changes">
                    <TabsList className="w-full">
                      <TabsTrigger value="changes" className="flex-1">
                        Changes
                      </TabsTrigger>
                      <TabsTrigger value="before" className="flex-1">
                        Before
                      </TabsTrigger>
                      <TabsTrigger value="after" className="flex-1">
                        After
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="changes" className="mt-4">
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {comparison.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>No changes detected in inventory</p>
                          </div>
                        ) : (
                          comparison.map((item, index) => (
                            <Card
                              key={index}
                              className={cn(
                                "p-3",
                                item.difference > 0
                                  ? "border-l-4 border-l-green-500"
                                  : item.difference < 0
                                    ? "border-l-4 border-l-red-500"
                                    : "border-l-4 border-l-gray-200",
                              )}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <span>Before: {item.beforeCount}</span>
                                    <span className="mx-2">→</span>
                                    <span>After: {item.afterCount}</span>
                                  </div>
                                </div>
                                <div>
                                  {item.difference > 0 ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      <PlusCircle className="h-3 w-3 mr-1" />+{item.difference} Added
                                    </Badge>
                                  ) : item.difference < 0 ? (
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                      <MinusCircle className="h-3 w-3 mr-1" />
                                      {item.difference} Removed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">No Change</Badge>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="before">
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        <h3 className="font-medium text-sm text-gray-500 mb-2">Before Inventory Items</h3>
                        {output.before.items.map((item, index) => (
                          <div key={index} className="flex justify-between p-2 border-b">
                            <span>{item}</span>
                            <Badge variant="outline">{output.before.number_of_items[index]}</Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="after">
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        <h3 className="font-medium text-sm text-gray-500 mb-2">After Inventory Items</h3>
                        {output.after.items.map((item, index) => (
                          <div key={index} className="flex justify-between p-2 border-b">
                            <span>{item}</span>
                            <Badge variant="outline">{output.after.number_of_items[index]}</Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

