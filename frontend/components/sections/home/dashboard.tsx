import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  Bar,
  Line,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data structure - replace with your actual data
const sampleData = {
  hourly: [
    { name: "PEPE", mentions: 145, marketCap: 15000, views: 50000 },
    { name: "DOGE", mentions: 120, marketCap: 80000, views: 45000 },
    { name: "SHIB", mentions: 98, marketCap: 60000, views: 30000 },
    { name: "FLOKI", mentions: 75, marketCap: 3000, views: 25000 },
    { name: "WOJAK", mentions: 50, marketCap: 1000, views: 15000 },
  ],
};

const MentionsChart = ({ timeframe }: any) => {
  return (
    <Card className="w-full p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Most Mentioned Coins ({timeframe})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampleData.hourly}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="mentions" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketCapDistribution = () => {
  const marketCapRanges = [
    { range: "<5k", count: 15 },
    { range: "5k-20k", count: 25 },
    { range: "20k-100k", count: 10 },
  ];

  return (
    <Card className="w-full p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Market Cap Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketCapRanges}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const ViewsChart = ({ timeframe }: any) => {
  return (
    <Card className="w-full p-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Views Over Time ({timeframe})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData.hourly}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const MemecoinDashboard = () => {
  const [timeframe, setTimeframe] = useState("1h");

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Memecoin Mentions Dashboard</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="3h">3 Hours</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="mentions" className="w-full">
        <TabsList>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="marketcap">Market Cap</TabsTrigger>
          <TabsTrigger value="views">Views</TabsTrigger>
        </TabsList>

        <TabsContent value="mentions">
          <MentionsChart timeframe={timeframe} />
        </TabsContent>

        <TabsContent value="marketcap">
          <MarketCapDistribution />
        </TabsContent>

        <TabsContent value="views">
          <ViewsChart timeframe={timeframe} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemecoinDashboard;
