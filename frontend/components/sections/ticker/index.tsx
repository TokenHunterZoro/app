"use client";
import { useEffect, useState } from "react";
import Tiktoks from "./tiktoks";
import TimeSeriesChart from "./time-series-chart";
import Tweets from "./tweets";
import getCoinData from "@/lib/supabase/getCoinData";
import { TokenData } from "@/lib/types";
import Image from "next/image";

export default function Ticker({ params }: { params: { id: string } }) {
  const [coinData, setCoinData] = useState<TokenData | null>(null);
  useEffect(() => {
    (async function () {
      setCoinData(await getCoinData(parseInt(params.id)));
    })();
  }, []);

  if (coinData === null)
    return (
      <div className="w-[1200px] mx-auto mt-12">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  return (
    <div className="w-[1200px] mx-auto mt-12">
      <TimeSeriesChart tokenData={coinData} />
      <Tweets tokenData={coinData} />
      <Tiktoks tokenData={coinData} />
    </div>
  );
}
