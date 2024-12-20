"use client";
import { useEffect, useState } from "react";
import Tiktoks from "./tiktoks";
import TimeSeriesChart from "./time-series-chart";
import Tweets from "./tweets";
import { TokenData } from "@/lib/types";
import Image from "next/image";
import { useEnvironmentStore } from "@/components/context";

export default function Ticker({ params }: { params: { id: string } }) {
  const [coinData, setCoinData] = useState<TokenData | null>(null);
  const { setTokenData } = useEnvironmentStore((store) => store);
  useEffect(() => {
    (async function () {
      const response = await fetch(
        `/api/supabase/get-coin-data?tokenId=${params.id}`
      );
      const data = await response.json();
      if (data && !data.error) {
        setCoinData(data);
        setTokenData(data.id, data);
        if (data.latest_price_usd === null) {
          // Update price data
        }
      }
    })();
  }, []);

  if (coinData === null)
    return (
      <div className="w-full xl:w-[1250px] mx-auto mt-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  return (
    <div className="w-full xl:w-[1250px] mx-auto mt-12 px-4">
      <TimeSeriesChart tokenData={coinData} />
      <Tweets symbol={coinData.symbol} tweets={coinData.tweets} growth="1.5" />
      <Tiktoks symbol={coinData.symbol} tiktoks={coinData.tiktoks} />
    </div>
  );
}
