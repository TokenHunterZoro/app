import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  timestamp: string;
  price: number;
  mentions: number;
  views: number;
}

type TimeframeType = "30m" | "1h" | "3h" | "24h" | "7d";

const generateTimeData = (timeframe: TimeframeType): DataPoint[] => {
  switch (timeframe) {
    case "30m":
      return Array.from({ length: 30 }, (_, i) => ({
        timestamp: `${Math.floor(i * 1)}m`,
        price: Math.random() * 100,
        mentions: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000),
      }));
    case "1h":
      return Array.from({ length: 12 }, (_, i) => ({
        timestamp: `${i * 5}m`,
        price: Math.random() * 100,
        mentions: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000),
      }));
    case "3h":
      return Array.from({ length: 18 }, (_, i) => ({
        timestamp: `${i * 10}m`,
        price: Math.random() * 100,
        mentions: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000),
      }));
    case "24h":
      return Array.from({ length: 24 }, (_, i) => ({
        timestamp: `${String(i).padStart(2, "0")}:00`,
        price: Math.random() * 100,
        mentions: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000),
      }));
    case "7d":
      return Array.from({ length: 7 }, (_, i) => ({
        timestamp: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
        price: Math.random() * 100,
        mentions: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000),
      }));
    default:
      return [];
  }
};

const TimeSeriesChart: React.FC = () => {
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showEngagement, setShowEngagement] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<TimeframeType>("24h");
  const [engagementMetric, setEngagementMetric] = useState<
    "mentions" | "views"
  >("mentions");
  const [data, setData] = useState<DataPoint[]>(generateTimeData("24h"));

  // Determine if price is up or down compared to start of timeframe
  const isPriceUp = useMemo(() => {
    if (data.length < 2) return true;
    return data[data.length - 1].price > data[0].price;
  }, [data]);

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setTimeframe(newTimeframe);
    setData(generateTimeData(newTimeframe));
  };

  const formatTooltipValue = (value: number, name: string): string => {
    if (name === "price") return `$${value.toFixed(2)}`;
    if (name === "mentions") return `${value} mentions`;
    if (name === "views") return `${value} views`;
    return value.toString();
  };

  const getTickInterval = (): number => {
    switch (timeframe) {
      case "24h":
        return 3; // Show every 3rd hour
      case "7d":
        return 1; // Show every day
      case "3h":
        return 3; // Show every 30 minutes
      case "1h":
        return 2; // Show every 10 minutes
      case "30m":
        return 5; // Show every 5 minutes
      default:
        return 1;
    }
  };

  const startingPrice = useMemo(() => {
    return data[0]?.price || 0;
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-bold">
            Price & Engagement Analysis
          </CardTitle>
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30m">30 Minutes</SelectItem>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="3h">3 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showPrice}
              onCheckedChange={setShowPrice}
              id="price-toggle"
              className="bg-[#F8D12E] data-[state=checked]:bg-[#F8D12E]"
            />
            <Label htmlFor="price-toggle" className="text-sm font-medium">
              Coin Price
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showEngagement}
              onCheckedChange={setShowEngagement}
              id="engagement-toggle"
              className="bg-[#F8D12E] data-[state=checked]:bg-[#F8D12E]"
            />
            <Label htmlFor="engagement-toggle" className="text-sm font-medium">
              TikTok Engagement
            </Label>
          </div>

          {showEngagement && (
            <Select
              value={engagementMetric}
              onValueChange={(value) => {
                setEngagementMetric(value as "mentions" | "views");
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mentions">Mentions</SelectItem>
                <SelectItem value="views">Views</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
            >
              <ReferenceLine
                y={startingPrice}
                yAxisId="price"
                stroke="#9CA3AF"
                strokeDasharray="3 3"
                label={{
                  value: `$${startingPrice.toFixed(2)}`,
                  position: "left",
                  fill: "#6B7280",
                  fontSize: 12,
                }}
              />
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 3"
                stroke="#374151"
              />
              <XAxis
                dataKey="timestamp"
                axisLine={{ stroke: "#E5E7EB" }}
                tick={{ fill: "#6B7280" }}
                interval={getTickInterval()}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                domain={["auto", "auto"]}
                axisLine={{ stroke: "#E5E7EB" }}
                tick={{ fill: "#6B7280" }}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) => `Time: ${label}`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                }}
              />

              {/* Reference line for starting price */}

              {showPrice && (
                <Line
                  yAxisId="price"
                  type="linear"
                  dataKey="price"
                  stroke={isPriceUp ? "#10B981" : "#EF4444"}
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
              )}

              {showEngagement && (
                <>
                  {engagementMetric === "mentions" ? (
                    <Line
                      yAxisId="price"
                      type="linear"
                      dataKey="mentions"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                      name="Mentions"
                    />
                  ) : (
                    <Line
                      yAxisId="price"
                      type="linear"
                      dataKey="views"
                      stroke="#F8D12E"
                      strokeWidth={2}
                      dot={false}
                      name="Views"
                    />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;
