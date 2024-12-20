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
  TooltipProps,
} from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEnvironmentStore } from "@/components/context";
import UnlockNow from "@/components/unlock-now";
import { TokenData } from "@/lib/types";

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

function ChartContent({
  data,
  showPrice,
  showViews,
  showMentions,
  timeframe,
  startingPrice,
  isPriceUp,
}: {
  data: DataPoint[];
  showPrice: boolean;
  showViews: boolean;
  showMentions: boolean;
  timeframe: TimeframeType;
  startingPrice: number;
  isPriceUp: boolean;
}) {
  const getTickInterval = (): number => {
    switch (timeframe) {
      case "24h":
        return window.innerWidth < 768 ? 6 : 3;
      case "7d":
        return 1;
      case "3h":
        return window.innerWidth < 768 ? 6 : 3;
      case "1h":
        return window.innerWidth < 768 ? 4 : 2;
      case "30m":
        return window.innerWidth < 768 ? 10 : 5;
      default:
        return 1;
    }
  };

  return (
    <CardContent className="p-0 sm:p-6">
      <div className="h-[300px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: window.innerWidth < 768 ? 10 : 0,
              left: window.innerWidth < 768 ? 10 : 20,
              bottom: 5,
            }}
          >
            <ReferenceLine
              y={startingPrice}
              yAxisId="price"
              stroke="#9CA3AF"
              strokeDasharray="3 3"
              label={{
                value: `$${startingPrice.toFixed(2)}`,
                position: "center",

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
              tick={{
                fill: "#6B7280",
                fontSize: window.innerWidth < 768 ? 10 : 12,
              }}
              interval={getTickInterval()}
            />
            <YAxis
              yAxisId="price"
              orientation="left"
              domain={[0, "auto"]}
              width={window.innerWidth < 768 ? 40 : 50}
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{
                fill: "#6B7280",
                fontSize: window.innerWidth < 768 ? 10 : 12,
              }}
            />
            <YAxis
              yAxisId="secondary"
              orientation="right"
              domain={[0, "auto"]}
              width={window.innerWidth < 768 ? 40 : 50}
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{
                fill: "#6B7280",
                fontSize: window.innerWidth < 768 ? 10 : 12,
              }}
            />

            <Tooltip
              content={({
                active,
                payload,
                label,
              }: TooltipProps<number, string>) => {
                if (!active || !payload || payload.length === 0) return null;

                return (
                  <div
                    className="p-4 bg-black border border-gray-700 rounded-lg text-gray-100 shadow-md"
                    style={{ maxWidth: "200px" }}
                  >
                    {payload.map((entry, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="font-medium ">{entry.name}:</span>
                        <span className="ml-5">
                          {entry.name == "Price"
                            ? entry.value?.toFixed(4)
                            : entry.value}
                        </span>
                      </div>
                    ))}
                    <p className="text-sm font-medium text-gray-400 mt-1 text-center">{`${label}`}</p>
                  </div>
                );
              }}
            />

            {/* Reference line for starting price */}

            {showViews && (
              <Line
                yAxisId="secondary"
                type="linear"
                dataKey="views"
                stroke="#800080"
                strokeWidth={2}
                dot={false}
                name="Views"
              />
            )}

            {showMentions && (
              <Line
                yAxisId="secondary"
                type="linear"
                dataKey="mentions"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                name="Mentions"
              />
            )}

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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  );
}

const PaywallOverlay = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Blur overlay for the chart */}
      <div
        className="absolute inset-0 w-full h-full backdrop-blur-md bg-black/40 rounded-lg"
        style={{ backdropFilter: "blur(8px)" }} // Added explicit blur
      />

      {/* Centered paywall card */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <UnlockNow text="Unlock the complete graph" />
      </div>
    </div>
  );
};
export default function TimeSeriesChartWithPaywall({
  tokenData,
}: {
  tokenData: TokenData;
}) {
  // Lift all state to the parent component
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showViews, setShowViews] = useState<boolean>(true);
  const [showMentions, setShowMentions] = useState<boolean>(true);
  const [usdOrSolToggle, setUsdOrSolToggle] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<TimeframeType>("24h");
  const [data, setData] = useState<DataPoint[]>(generateTimeData("24h"));
  const { paid } = useEnvironmentStore((store) => store);

  const startingPrice = useMemo(() => data[0]?.price || 0, [data]);
  const priceChange = useMemo(() => {
    if (data.length < 2) return "0.000";
    return (
      ((data[data.length - 1].price - data[0].price) / data[0].price) *
      100
    ).toFixed(3);
  }, [data]);
  const isPriceUp = useMemo(() => {
    if (data.length < 2) return true;
    return data[data.length - 1].price > data[0].price;
  }, [data]);

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setTimeframe(newTimeframe);
    setData(generateTimeData(newTimeframe));
  };

  return (
    <Card className="w-full max-w-[100vw] overflow-hidden sen">
      <CardHeader className="space-y-4 p-4 sm:p-6">
        {/* Token Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center">
            <img
              src={tokenData.image}
              className="rounded-full mr-2 w-6 h-6 sm:w-8 sm:h-8"
            />
            <CardTitle className="text-lg sm:text-xl font-bold text-[#F8D12E] nouns tracking-widest">
              {tokenData.symbol.toLocaleUpperCase()}
              <span className="text-muted-foreground text-xs sm:text-sm font-medium sen tracking-normal">
                /{usdOrSolToggle ? "USD" : "SOL"}
              </span>
            </CardTitle>
          </div>

          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-24 sm:w-32">
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

        {/* Price Display */}
        <div className="flex items-center flex-wrap gap-2">
          <p className="font-semibold text-xl sm:text-3xl">
            {usdOrSolToggle
              ? tokenData.latest_price_usd.toFixed(10)
              : tokenData.latest_price_sol.toFixed(10)}
          </p>
          {isPriceUp ? (
            <span className="flex items-center text-green-500 text-sm sm:text-md">
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="ml-1">+{priceChange}%</span>
            </span>
          ) : (
            <span className="flex items-center text-red-500 text-sm sm:text-md">
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="ml-1">{priceChange}%</span>
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sen">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showPrice}
              onCheckedChange={setShowPrice}
              id="price-toggle"
              className="bg-[#F8D12E] data-[state=checked]:bg-[#F8D12E]"
            />
            <div
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                isPriceUp ? "bg-[#10B981]" : "bg-[#EF4444]"
              }`}
            />
            <Label
              htmlFor="price-toggle"
              className="text-xs sm:text-sm font-medium"
            >
              Coin Price
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showViews}
              onCheckedChange={setShowViews}
              id="views-toggle"
              className="bg-[#F8D12E] data-[state=checked]:bg-[#F8D12E]"
            />
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#800080]" />
            <Label
              htmlFor="views-toggle"
              className="text-xs sm:text-sm font-medium"
            >
              TikTok Views
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showMentions}
              onCheckedChange={setShowMentions}
              id="mentions-toggle"
              className="bg-[#F8D12E] data-[state=checked]:bg-[#F8D12E]"
            />
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#2563EB]" />
            <Label
              htmlFor="mentions-toggle"
              className="text-xs sm:text-sm font-medium"
            >
              TikTok Mentions
            </Label>
          </div>
        </div>
      </CardHeader>

      <div className="relative">
        <ChartContent
          data={data}
          showPrice={showPrice}
          showViews={showViews}
          showMentions={showMentions}
          timeframe={timeframe}
          startingPrice={startingPrice}
          isPriceUp={isPriceUp}
        />
        {!paid && <PaywallOverlay />}
      </div>
    </Card>
  );
}
