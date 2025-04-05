"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#FF8042"];

const InventoryCard = ({ data }: { data: any }) => {
  const chartData = data.items.map((item: string, index: number) => ({
    name: item,
    value: parseInt(data.number_of_items[index], 10),
  }));

  const minVal = Math.min(...chartData.map((item: { value: any; }) => item.value));
  const lowStockItems = chartData
    .filter((item: { value: number; }) => item.value === minVal)
    .map((item: { name: any; }) => item.name)
    .join(", ");

  return (
    
    <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-white">Inventory Management</h3>
        <div className='flex items-center justify-center'>
          <PieChart width={250} height={250}>
            <Pie
              data={chartData}
              cx={120}
              cy={120}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {chartData.map((_: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <p className="mt-3 text-sm text-yellow-300">
          ⚠️ Low Stock: {lowStockItems}
        </p> 
      </CardContent>
    </Card>
    
  );
};

const SecurityCard = ({ data }: { data: any }) => {
  const getTimeStamp = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const log = data.item
    .map((item: string, idx: number) => {
      const status = data.status_or_position[idx];
      if (status.toLowerCase() === "unchanged") return null;
      return `${getTimeStamp()} - ${item} ${status}`;
    })
    .filter(Boolean);

  return (
    <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Security Activity Log</h3>
        <div className="text-left space-y-2 text-sm">
          {log.map((entry: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
            <div key={idx} className="text-green-300">
              {entry}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SpaceCard = ({ data }: { data: any }) => {
  return (
    <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-4 text-white">Space Optimization</h3>
        <div className="text-left space-y-2 text-sm">
          {data.items.map((item: string, idx: number) => (
            <div key={idx}>
              <span className="font-bold">{item}</span>: {data.suggestions[idx]}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyAccountPage({ params }: any) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getUsername = async () => {
      const param = await params;
      const paramUsername = param.username;
      setUsername(paramUsername);
    };
    getUsername();
  }, [params]);

  const router = useRouter();

  // Simulated backend data
  const inventoryData = {
    items: ["Bottle", "Glasses", "Laptop"],
    number_of_items: ["2", "3", "1"],
  };

  const securityData = {
    item: ["Person", "Cup", "Bottle"],
    status_or_position: ["person detected", "unchanged", "added"],
  };

  const spaceOptimizationData = {
    items: ["Bottle", "Box", "Laptop"],
    suggestions: [
      "empty space on left, can move left",
      "empty space on both sides, can move to any side",
      "no significant empty space around",
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      {/* Top-Right Avatar Dropdown */}
      <div className="absolute top-4 right-4 z-50">
        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer w-10 h-10 bg-gray-200" />
          </PopoverTrigger>
          <PopoverContent className="w-40 mt-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => router.push(`/home/${username}`)}
              >
                Home
              </Button>
              <Button variant="ghost" className="justify-start" onClick={() => router.push(`/home`)}>
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
    </div>
  );
}
