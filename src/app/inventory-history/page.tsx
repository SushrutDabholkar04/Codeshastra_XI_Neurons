"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowDown, ArrowUp, Minus, Package } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function InventoryHistoryPage() {
  const router = useRouter()

  // Mock history data
  const historyData = [
    { date: "2023-04-06", item: "Bottle", action: "added", quantity: 1, newTotal: 2 },
    { date: "2023-04-05", item: "Glasses", action: "added", quantity: 1, newTotal: 3 },
    { date: "2023-04-04", item: "Laptop", action: "unchanged", quantity: 0, newTotal: 1 },
    { date: "2023-04-03", item: "Bottle", action: "removed", quantity: 1, newTotal: 1 },
    { date: "2023-04-02", item: "Glasses", action: "added", quantity: 2, newTotal: 2 },
    { date: "2023-04-01", item: "Laptop", action: "added", quantity: 1, newTotal: 1 },
  ]

  // Data for the chart
  const chartData = [
    { name: "Apr 1", Bottle: 0, Glasses: 0, Laptop: 1 },
    { name: "Apr 2", Bottle: 0, Glasses: 2, Laptop: 1 },
    { name: "Apr 3", Bottle: 1, Glasses: 2, Laptop: 1 },
    { name: "Apr 4", Bottle: 1, Glasses: 2, Laptop: 1 },
    { name: "Apr 5", Bottle: 1, Glasses: 3, Laptop: 1 },
    { name: "Apr 6", Bottle: 2, Glasses: 3, Laptop: 1 },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Inventory History</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Inventory Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Bottle" fill="#8884d8" />
                <Bar dataKey="Glasses" fill="#82ca9d" />
                <Bar dataKey="Laptop" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        

        <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
        <div className="space-y-4">
            {historyData.map((entry, idx) => {
            const isAddition = entry.action === "added"
            const isRemoval = entry.action === "removed"

            return (
                <Card key={idx}>
                <CardContent className="p-4">
                    <div className="flex items-start">
                    <div
                        className={`mt-0.5 mr-3 rounded-full p-1 ${isAddition ? "bg-green-100" : isRemoval ? "bg-red-100" : "bg-gray-100"}`}
                    >
                        {isAddition ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : isRemoval ? (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                        ) : (
                        <Minus className="h-4 w-4 text-gray-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                        <div>
                            <span className="font-medium">{entry.item}</span>
                            <span className="ml-2 text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-sm font-medium">{entry.newTotal}</span>
                        </div>
                        </div>
                        <p
                        className={`text-sm ${isAddition ? "text-green-700" : isRemoval ? "text-red-700" : "text-gray-700"}`}
                        >
                        {isAddition ? `Added ${entry.quantity}` : isRemoval ? `Removed ${entry.quantity}` : "No change"}
                        </p>
                    </div>
                    </div>
                </CardContent>
                </Card>
            )
            })}
        </div>
        </CardContent>
      </Card>
      <div className="pt-8 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Detectify App • {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

