"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar } from "@/components/ui/avatar";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#FF8042"];

const FeatureCard = ({ title, data }: { title: string; data: any }) => {
  const chartData = data.items.map((item: string, index: number) => ({
    name: item,
    value: parseInt(data.number_of_items[index], 10),
}));

  return (
    <Card className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-2xl rounded-2xl hover:scale-[1.02] transition-transform">
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
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
        <Button
          variant="secondary"
          className="mt-4 text-white border-white/50 bg-white/20 hover:bg-white/30"
        >
          View History
        </Button>
      </CardContent>
    </Card>
  );
};

export default function MyAccountPage({params}: any) {

    const [username, setUsername] = useState('');
    useEffect( () => {   
        const getUsername = async() => {
        const param = await params;
        const paramUsername = param.username;
        setUsername(paramUsername);
        };
        getUsername();
    }, [params]);

    const router = useRouter();

    const securityData = {
        items: ["Camera", "Alarm"],
        number_of_items: ["1", "2"],
    };

    const inventoryData = {
        items: ["Goggles", "Fan"],
        number_of_items: ["1", "2"],
    };

    const spaceOptimizationData = {
        items: ["Used", "Free"],
        number_of_items: ["3", "5"],
    };

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      {/* Circular Dropdown Button Top-Right */}
      <div className="absolute top-4 right-4 z-50">
      <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer w-10 h-10 bg-gray-200" />
            </PopoverTrigger>
            <PopoverContent className="w-40 mt-2">
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" onClick={() => router.push(`/home/${username}`)}>
                  Home
                </Button>
                <Button variant="ghost" className="justify-start" >
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
      </div>

      <div className="flex flex-col items-center justify-center gap-10 pt-16">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <FeatureCard title="Security" data={securityData} />
          <FeatureCard title="Inventory Management" data={inventoryData} />
          <FeatureCard title="Space Optimization" data={spaceOptimizationData} />
        </div>
      </div>
    </div>
  );
}
