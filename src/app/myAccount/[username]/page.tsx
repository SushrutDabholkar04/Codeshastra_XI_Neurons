"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar } from "@/components/ui/avatar"
import { AlertCircle, AlertTriangle, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#FF8042"]

const InventoryCard = ({ data }: { data: any }) => {
  const router = useRouter()
  const chartData = data.items.map((item: string, index: number) => ({
    name: item,
    value: Number.parseInt(data.number_of_items[index], 10),
  }))
  const minVal = Math.min(...chartData.map((item: { value: any }) => item.value))
  const lowStockItems = chartData
    .filter((item: { value: number }) => item.value === minVal)
    .map((item: { name: any }) => item.name)
    .join(", ")

  return (
    <Card className="w-full max-w-sm h-[500px] bg-white border border-gray-300 text-black shadow-lg rounded-2xl hover:scale-[1.02] transition-transform flex flex-col justify-between">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
        <div className="flex items-center justify-center">
          <PieChart width={250} height={250}>
            <Pie data={chartData} cx={120} cy={120} outerRadius={80} fill="#8884d8" dataKey="value" label>
              {chartData.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <p className="mt-3 text-sm text-red-600">⚠️ Low Stock: {lowStockItems}</p>
      </CardContent>
      <CardFooter className="pb-4 px-4 flex justify-center">
        <Button variant="outline" onClick={() => router.push("/inventory-history")}>
          View History
        </Button>
      </CardFooter>
    </Card>
  )
}

const SecurityCard = ({ data }: { data: any }) => {
  const router = useRouter()
  const getTimeStamp = () => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  }

  return (
    <Card className="w-full max-w-sm h-[500px] bg-white border border-gray-300 text-black shadow-lg rounded-2xl hover:scale-[1.02] transition-transform flex flex-col justify-between">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-4">Security Activity Log</h3>
        <div className="text-left space-y-2 overflow-y-auto max-h-64 pr-2">
          {data.item
            .map((item: string, idx: number) => {
              const status = data.status_or_position[idx]
              if (status.toLowerCase() === "unchanged") return null
              const isAddition = status.toLowerCase().includes("added") || status.toLowerCase().includes("detected")
              const isRemoval = status.toLowerCase().includes("removed") || status.toLowerCase().includes("missing")

              return (
                <Alert
                  key={idx}
                  variant="default"
                  className={`${isAddition ? "border-green-500 bg-green-50" : isRemoval ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"} mb-2`}
                >
                  {isAddition ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : isRemoval ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <AlertDescription
                    className={`${isAddition ? "text-green-700" : isRemoval ? "text-red-700" : "text-yellow-700"} text-sm`}
                  >
                    {getTimeStamp()} - {item} {status}
                  </AlertDescription>
                </Alert>
              )
            })
            .filter(Boolean)}
        </div>
      </CardContent>
      <CardFooter className="pb-4 px-4 flex justify-center">
        <Button variant="outline" onClick={() => router.push("/security-history")}>
          View History
        </Button>
      </CardFooter>
    </Card>
  )
}

const SpaceCard = ({ data }: { data: any }) => {
  const router = useRouter()
  return (
    <Card className="w-full max-w-sm h-[500px] bg-white border border-gray-300 text-black shadow-lg rounded-2xl hover:scale-[1.02] transition-transform flex flex-col justify-between">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-4">Space Optimization</h3>
        <div className="text-left space-y-3 overflow-y-auto max-h-64 pr-2">
          {data.items.map((item: string, idx: number) => {
            const suggestion = data.suggestions[idx]
            const hasMoveLeft = suggestion.includes("left")
            const hasMoveRight = suggestion.includes("right") || suggestion.includes("any side")
            const hasNoSpace = suggestion.includes("no significant")

            return (
              <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">{item}</span>
                  {hasNoSpace ? (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">Optimal</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Can optimize</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{suggestion}</p>
                {!hasNoSpace && (
                  <div className="flex gap-2 mt-2">
                    {hasMoveLeft && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Move left</span>
                    )}
                    {hasMoveRight && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Move right</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="pb-4 px-4 flex justify-center">
        <Button variant="outline" onClick={() => router.push("/space-history")}>
          View History
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function MyAccountPage({ params }: any) {
  const [username, setUsername] = useState("")

  useEffect(() => {
    const getUsername = async () => {
      const param = await params
      const paramUsername = param.username
      setUsername(paramUsername)
    }
    getUsername()
  }, [params])

  const router = useRouter()

  const inventoryData = {
    items: ["Bottle", "Glasses", "Laptop"],
    number_of_items: ["2", "3", "1"],
  }

  const securityData = {
    item: ["Person", "Cup", "Bottle", "keychain"],
    status_or_position: ["detected", "unchanged", "added", "removed"],
  }

  const spaceOptimizationData = {
    items: ["Bottle", "Box", "Laptop"],
    suggestions: [
      "empty space on left, can move left",
      "empty space on both sides, can move to any side",
      "no significant empty space around",
    ],
  }

  return (
    <div className="min-h-screen bg-white text-black p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer w-10 h-10 bg-gray-300" />
          </PopoverTrigger>
          <PopoverContent className="w-40 mt-2 bg-white border border-gray-300 shadow-md">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start text-black"
                onClick={() => router.push(`/home/${username}`)}
              >
                Home
              </Button>
              <Button variant="ghost" className="justify-start text-black" onClick={() => router.push(`/home`)}>
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col items-center justify-center gap-10 pt-16">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <SecurityCard data={securityData} />
          <InventoryCard data={inventoryData} />
          <SpaceCard data={spaceOptimizationData} />
        </div>
      </div>
      <div className="pt-12 pb-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Detectify App • {new Date().getFullYear()}</p>
        </div>
    </div>
  )
}
