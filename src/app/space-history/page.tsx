"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Move, Calendar } from "lucide-react"

export default function SpaceHistoryPage() {
  const router = useRouter()

  // Mock history data
  const historyData = [
    {
      date: "2023-04-06",
      items: [
        { name: "Bottle", suggestion: "empty space on left, can move left", action: "Moved left" },
        { name: "Box", suggestion: "empty space on both sides, can move to any side", action: "No action taken" },
      ],
    },
    {
      date: "2023-04-05",
      items: [
        { name: "Laptop", suggestion: "no significant empty space around", action: "Optimal position" },
        { name: "Box", suggestion: "empty space on right, can move right", action: "Moved right" },
      ],
    },
    {
      date: "2023-04-04",
      items: [
        { name: "Bottle", suggestion: "empty space on right, can move right", action: "Moved right" },
        { name: "Laptop", suggestion: "empty space on left, can move left", action: "Moved left" },
      ],
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Space Optimization History</h1>
      </div>

      <div className="space-y-6">
        {historyData.map((day, dayIdx) => (
          <div key={dayIdx} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h2 className="text-lg font-semibold">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
            </div>

            <Card>
              <CardContent className="p-4 space-y-4">
                {day.items.map((item, itemIdx) => {
                  const isOptimal = item.suggestion.includes("no significant") || item.action.includes("Optimal")
                  const actionTaken = !item.action.includes("No action") && !item.action.includes("Optimal")

                  return (
                    <div
                      key={itemIdx}
                      className={`p-4 rounded-lg border ${actionTaken ? "border-blue-200 bg-blue-50" : isOptimal ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div className="flex items-start">
                        <div
                          className={`mt-0.5 mr-3 rounded-full p-1 ${actionTaken ? "bg-blue-100" : isOptimal ? "bg-green-100" : "bg-gray-100"}`}
                        >
                          <Move
                            className={`h-4 w-4 ${actionTaken ? "text-blue-600" : isOptimal ? "text-green-600" : "text-gray-600"}`}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <p className="text-sm text-gray-600 mt-1">{item.suggestion}</p>
                          <div className="mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${actionTaken ? "bg-blue-100 text-blue-700" : isOptimal ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {item.action}
                            </span>
                          </div>
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

