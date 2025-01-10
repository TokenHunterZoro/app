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
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import {
  ArrowUpRightFromSquare,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { useEnvironmentStore } from "@/components/context";
import UnlockNow from "@/components/unlock-now";
import { TimeframeType, DataPoint, TokenData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatFloatingNumber,
  processTradeData,
} from "@/lib/utils";

function ChartContent({
  data,
  showPrice,
  showPopularity,
  timeframe,
  startingPrice,
  isPriceUp,
}: {
  data: DataPoint[];
  showPrice: boolean;
  showPopularity: boolean;
  timeframe: TimeframeType;
  startingPrice: number;
  isPriceUp: boolean;
}) {
  const maxPrice = Math.max(...data.map((d) => d.price));
  const minPrice = Math.min(...data.map((d) => d.price));
  const priceMargin = (maxPrice - minPrice) * 1.5;

  // Get domain for X axis
  const xDomain = useMemo(() => {
    if (data.length === 0) return [0, 0];
    return [
      Math.min(...data.map((d) => d.rawTimestamp)),
      Math.max(...data.map((d) => d.rawTimestamp)),
    ];
  }, [data]);

  const getTickCount = (): number => {
    return 7;
  };

  return (
    <CardContent className="p-0 sm:p-6">
      <div className="h-[300px] sm:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: window.innerWidth < 768 ? 10 : 20,
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
              dataKey="rawTimestamp"
              type="number"
              domain={xDomain}
              scale="time"
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                const hours = date.getHours();
                const minutes = date.getMinutes();
                return `${String(hours).padStart(2, "0")}:${String(
                  minutes
                ).padStart(2, "0")}`;
              }}
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{
                fill: "#6B7280",
                fontSize: window.innerWidth < 768 ? 10 : 12,
              }}
              interval={Math.floor(data.length / getTickCount())}
            />
            <YAxis
              yAxisId="price"
              orientation="left"
              domain={[minPrice - priceMargin * 0.1, maxPrice]}
              width={window.innerWidth < 768 ? 40 : 50}
              axisLine={{ stroke: "#E5E7EB" }}
              tick={{
                fill: "#6B7280",
                fontSize: window.innerWidth < 768 ? 10 : 12,
              }}
              tickFormatter={(value) => formatFloatingNumber(value)}
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

            {showPrice && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke={isPriceUp ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                dot={false}
                name="Price"
                connectNulls={true}
              />
            )}

            {showPopularity && (
              <Line
                yAxisId="secondary"
                type="monotone"
                dataKey="popularity"
                stroke="#800080"
                strokeWidth={2}
                dot={false}
                name="Popularity"
              />
            )}

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="border bg-card p-2">
                      <p className="font-bold m-0">{formatDateTime(label)}</p>
                      {payload.map((entry, index) => (
                        <p key={index} className="m-0">
                          {entry.name}: {entry.name === "Price" ? "$" : ""}
                          {formatFloatingNumber(entry.value as number)}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
              cursor={false}
            />
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
  const [showPopularity, setShowPopularity] = useState<boolean>(true);
  const [usdOrSolToggle, setUsdOrSolToggle] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<TimeframeType>("24h");
  const { paid } = useEnvironmentStore((store) => store);
  const data = useMemo(
    () =>
      processTradeData(
        tokenData.prices,
        tokenData.tiktoks
          ? tokenData.tiktoks.length > 1
            ? tokenData.tiktoks[0].count
            : 0
          : 0,
        tokenData.tiktoks
          ? tokenData.tiktoks.length > 2
            ? tokenData.tiktoks[tokenData.tiktoks.length - 1].count
            : tokenData.tiktoks.length > 1
            ? tokenData.tiktoks[0].count
            : 0
          : 0,
        tokenData.views,
        timeframe
      ),
    [tokenData.prices, timeframe]
  );
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
              <span
                className="text-muted-foreground text-xs sm:text-sm font-medium sen tracking-normal cursor-pointer"
                onClick={() => {
                  setUsdOrSolToggle(!usdOrSolToggle);
                }}
              >
                /{usdOrSolToggle ? "USD" : "SOL"}
              </span>
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="hidden sm:flex hover:bg-transparent hover:border-[1px] hover:border-secondary transform transition hover:scale-105"
              onClick={() =>
                window.open(
                  `https://solscan.io/token/${tokenData.address}`,
                  "_blank"
                )
              }
            >
              {tokenData.address.slice(0, 4)}...{tokenData.address.slice(-4)}
              <ArrowUpRightFromSquare className="w-3 h-3 ml-1" />
            </Button>
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>

              {/* Full names for larger screens */}
              <SelectContent>
                <SelectItem value="30m">30 Minutes</SelectItem>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="3h">3 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Display */}
        <div className="flex items-center flex-wrap gap-2">
          <p className="font-semibold text-xl sm:text-3xl">
            {usdOrSolToggle
              ? (tokenData.latest_price_usd || 0).toFixed(10)
              : (tokenData.latest_price_sol || 0).toFixed(10)}
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
              checked={showPopularity}
              onCheckedChange={setShowPopularity}
              id="views-toggle"
              className="bg-[#F8D12E] data-[state=checked]:bg-[#F8D12E]"
            />
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#800080]" />
            <Label
              htmlFor="popularity-toggle"
              className="text-xs sm:text-sm font-medium"
            >
              TikTok Popularity
            </Label>
            <TooltipProvider>
              <TooltipUI delayDuration={100}>
                <TooltipTrigger>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                </TooltipTrigger>
                <TooltipContent className="text-center">
                  Popularity is calculated using views and <br />
                  mentions of the tickers in the video and <br />
                  comments.
                </TooltipContent>
              </TooltipUI>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <div className="relative">
        <ChartContent
          data={data}
          showPrice={showPrice}
          showPopularity={showPopularity}
          timeframe={timeframe}
          startingPrice={startingPrice}
          isPriceUp={isPriceUp}
        />
        {!paid && <PaywallOverlay />}
      </div>
    </Card>
  );
}
