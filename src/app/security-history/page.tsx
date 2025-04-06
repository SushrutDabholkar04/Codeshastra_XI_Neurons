"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Check, Clock } from "lucide-react"

export default function SecurityHistoryPage() {
  const router = useRouter()

  // Mock history data
  const historyData = [
    { date: "2023-04-06", time: "09:15", item: "Person", status: "person detected" },
    { date: "2023-04-06", time: "08:30", item: "Bottle", status: "added" },
    { date: "2023-04-05", time: "17:45", item: "Laptop", status: "removed" },
    { date: "2023-04-05", time: "14:20", item: "Box", status: "added" },
    { date: "2023-04-04", time: "11:10", item: "Cup", status: "removed" },
    { date: "2023-04-04", time: "10:05", item: "Person", status: "person detected" },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Security Activity History</h1>
      </div>

      <div className="space-y-6">
        {/* Group by date */}
        {Array.from(new Set(historyData.map((item) => item.date))).map((date) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <h2 className="text-lg font-semibold">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
            </div>

            <Card>
              <CardContent className="p-4">
                {historyData
                  .filter((item) => item.date === date)
                  .map((entry, idx) => {
                    const isAddition =
                      entry.status.toLowerCase().includes("added") || entry.status.toLowerCase().includes("detected")
                    const isRemoval = entry.status.toLowerCase().includes("removed")

                    return (
                      <div
                        key={idx}
                        className={`p-3 mb-2 rounded-lg border ${isAddition ? "border-green-200 bg-green-50" : isRemoval ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex items-start">
                          <div
                            className={`mt-0.5 mr-3 rounded-full p-1 ${isAddition ? "bg-green-100" : isRemoval ? "bg-red-100" : "bg-gray-100"}`}
                          >
                            {isAddition ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : isRemoval ? (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium">{entry.item}</span>
                              <span className="ml-2 text-xs text-gray-500">{entry.time}</span>
                            </div>
                            <p
                              className={`text-sm ${isAddition ? "text-green-700" : isRemoval ? "text-red-700" : "text-gray-700"}`}
                            >
                              {entry.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <div className="pt-8 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Detectify App • {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

