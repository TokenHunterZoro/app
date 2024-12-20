"use client";
import { useEffect, useState } from "react";
import Tiktoks from "./tiktoks";
import TimeSeriesChart from "./time-series-chart";
import Tweets from "./tweets";
import { TokenData } from "@/lib/types";
import Image from "next/image";
import { useEnvironmentStore } from "@/components/context";
import { IPFS_GATEWAY_URL } from "@/lib/constants";

export default function Ticker({ params }: { params: { id: string } }) {
  const [coinData, setCoinData] = useState<TokenData | null>(null);
  const { setToken, tokens } = useEnvironmentStore((store) => store);
  const [imageFetched, setImageFetched] = useState(false);
  const [refreshPrices, setRefreshPrices] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (tokens[params.id]) {
        setCoinData(tokens[params.id]);
      } else {
        const response = await fetch(
          `/api/supabase/get-coin-data?tokenId=${params.id}`
        );
        const data = await response.json();
        if (data && !data.error) {
          setImageFetched(false);
          setCoinData(data);
          setToken(data.id, data);

          const updateResponse = await fetch(`/api/supabase/update-price`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tokenId: params.id }),
          });
          console.log("updateResponse");
          console.log(updateResponse);

          setRefreshPrices(true);
        }
      }
    };

    fetchData();
  }, [params.id, setToken, tokens]);

  useEffect(() => {
    if (coinData && !imageFetched) {
      const fetchImage = async () => {
        const metadataResponse = await fetch(
          IPFS_GATEWAY_URL + coinData.uri.split("/").at(-1)
        );
        const metadata = await metadataResponse.json();
        coinData.image = metadata.image;
        setImageFetched(true);
      };
      fetchImage();
    }
  }, [coinData, imageFetched]);

  useEffect(() => {
    if (refreshPrices) {
      console.log("REFRESHING PRICES");
      console.log(coinData);
      fetch(`/api/supabase/get-prices?tokenId=${params.id}`).then((res) => {
        res.json().then((data) => {
          setCoinData((prev) => (prev ? { ...prev, prices: data.data } : null));
        });
        setRefreshPrices(false);
      });
    }
  }, [refreshPrices]);

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
