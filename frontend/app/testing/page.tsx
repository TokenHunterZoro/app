"use client";
import React, { useEffect, useRef } from "react";
import { createChart, Time } from "lightweight-charts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimeRange = "1H" | "12H" | "1D" | "7D" | "1M" | "1Y" | "ALL";

const getTimeRangeConfig = (timeRange: TimeRange) => {
  // Total duration for each range in milliseconds
  const rangeDurations = {
    "1H": 60 * 60 * 1000,
    "12H": 12 * 60 * 60 * 1000,
    "1D": 24 * 60 * 60 * 1000,
    "7D": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
    "1Y": 365 * 24 * 60 * 60 * 1000,
    ALL: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years for ALL
  };

  // Interval for each data point based on range
  const intervals = {
    "1H": 60 * 1000, // 1 minute
    "12H": 5 * 60 * 1000, // 5 minutes
    "1D": 15 * 60 * 1000, // 15 minutes
    "7D": 60 * 60 * 1000, // 1 hour
    "1M": 4 * 60 * 60 * 1000, // 4 hours
    "1Y": 24 * 60 * 60 * 1000, // 1 day
    ALL: 7 * 24 * 60 * 60 * 1000, // 1 week
  };

  return {
    duration: rangeDurations[timeRange],
    interval: intervals[timeRange],
  };
};

const generateCandleData = (timeRange: TimeRange) => {
  const data = [];
  const endTime = new Date();
  const { duration, interval } = getTimeRangeConfig(timeRange);
  const startTime = new Date(endTime.getTime() - duration);
  let currentTime = new Date(startTime);
  let basePrice = 0.07234;

  while (currentTime <= endTime) {
    const volatility = 0.05;
    const change = basePrice * (Math.random() - 0.5) * volatility;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + basePrice * Math.random() * 0.02;
    const low = Math.min(open, close) - basePrice * Math.random() * 0.02;

    data.push({
      time: (currentTime.getTime() / 1000) as Time,
      open: Number(open.toFixed(8)),
      high: Number(high.toFixed(8)),
      low: Number(low.toFixed(8)),
      close: Number(close.toFixed(8)),
      volume: Math.floor(Math.random() * 1000000),
    });

    basePrice = close;
    currentTime = new Date(currentTime.getTime() + interval);
  }

  return data;
};

const MemeChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  const [timeRange, setTimeRange] = React.useState<TimeRange>("1D");
  const [data, setData] = React.useState<ReturnType<typeof generateCandleData>>(
    []
  );

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current) {
        const parent = chartContainerRef.current?.parentElement;
        if (parent) {
          chartRef.current.applyOptions({
            width: parent.clientWidth,
            height: parent.clientHeight,
          });
        }
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#121212" },
        textColor: "#eeeeee",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      width: 700,
      height: 400,
      rightPriceScale: {
        borderVisible: false,
      },
      leftPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: {
          width: 1,
          color: "#374151",
          style: 3,
        },
        horzLine: {
          width: 1,
          color: "#374151",
          style: 3,
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const newData = generateCandleData(timeRange);
    candlestickSeries.setData(newData);
    setData(newData);

    chartRef.current = chart;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [timeRange]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4">
      <Card className="w-full bg-background text-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>DOGE/USD Price Chart</CardTitle>
          <Tabs
            defaultValue={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <TabsList>
              <TabsTrigger value="1H">1H</TabsTrigger>
              <TabsTrigger value="12H">12H</TabsTrigger>
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="7D">7D</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="ALL">ALL</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div
            ref={chartContainerRef}
            className="w-full h-[400px] rounded-lg overflow-hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MemeChart;
