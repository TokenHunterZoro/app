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
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useEnvironmentStore } from "@/components/context";
import UnlockNow from "@/components/unlock-now";
import { TokenData } from "@/lib/types";

interface TradeData {
  price_usd: number;
  price_sol: number;
  trade_at: string;
}

interface DataPoint {
  timestamp: string;
  rawTimestamp: number;
  price: number;
  popularity: number;
}

type TimeframeType = "30m" | "1h" | "3h" | "24h" | "7d";

const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
function formatFloatingNumber(number: number) {
  if (number === 0) return "0.000"; // Special case for zero

  const absNumber = Math.abs(number);
  const decimalPlaces = Math.max(0, 3 - Math.floor(Math.log10(absNumber)));

  // Round the number to the desired precision
  const rounded = Number(absNumber.toFixed(decimalPlaces));

  // Return the number, keeping the sign
  return (number < 0 ? -rounded : rounded).toString();
}
const processTradeData = (
  trades: TradeData[],
  startMentions: number,
  endMentions: number,
  views: number,
  timeframe: TimeframeType
): DataPoint[] => {
  const now = Date.now();
  const timeframeLimit = {
    "30m": 1000 * 60 * 30,
    "1h": 1000 * 60 * 60,
    "3h": 1000 * 60 * 60 * 3,
    "24h": 1000 * 60 * 60 * 24,
    "7d": 1000 * 60 * 60 * 24 * 7,
  }[timeframe];

  const cutoffTime = now - timeframeLimit;

  // Filter trades within the timeframe and sort by timestamp
  const filteredTrades = trades
    .filter((trade) => new Date(trade.trade_at).getTime() >= cutoffTime)
    .sort(
      (a, b) => new Date(a.trade_at).getTime() - new Date(b.trade_at).getTime()
    );

  // Calculate mentions change rate
  const mentionsChange = endMentions - startMentions;
  const mentionsChangeRate = mentionsChange / startMentions; // Relative change

  // Calculate popularity for each point
  return filteredTrades.map((trade, index) => {
    const tradeDate = new Date(trade.trade_at);
    const timeProgress = index / (filteredTrades.length - 1); // 0 to 1

    // Base popularity starts at 50 plus views contribution
    let popularity = 50 + views * 0.0001; // Scale views down to avoid too large numbers

    // Adjust based on mentions trend
    if (mentionsChangeRate > 0) {
      // Increasing mentions - popularity grows exponentially
      popularity += mentionsChangeRate * 100 * Math.pow(timeProgress, 2);
    } else {
      // Decreasing or stable mentions - popularity declines linearly
      popularity -= Math.abs(mentionsChangeRate * 50) * timeProgress;
    }

    // Ensure popularity stays within reasonable bounds
    popularity = Math.max(0, Math.min(100, popularity));

    return {
      timestamp: formatTimestamp(trade.trade_at, timeframe),
      rawTimestamp: tradeDate.getTime(),
      price: trade.price_usd,
      popularity: popularity,
    };
  });
};

const formatTimestamp = (
  timestamp: string,
  timeframe: TimeframeType
): string => {
  const date = new Date(timestamp);

  switch (timeframe) {
    case "30m":
    case "1h":
    case "3h":
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    case "24h":
      return `${String(date.getHours()).padStart(2, "0")}:00`;
    case "7d":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    default:
      return timestamp;
  }
};
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
        tokenData.tiktoks.length > 1 ? tokenData.tiktoks[0].count : 0,
        tokenData.tiktoks.length > 2
          ? tokenData.tiktoks[tokenData.tiktoks.length - 1].count
          : tokenData.tiktoks.length > 1
          ? tokenData.tiktoks[0].count
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
