"use client";
import Tiktoks from "./tiktoks";
import TimeSeriesChart from "./time-series-chart";
import Tweets from "./tweets";

export default function Ticker({ params }: { params: { ticker: string } }) {
  return (
    <div className="w-[1200px] mx-auto mt-12">
      <TimeSeriesChart ticker={params.ticker} />
      <Tweets ticker={params.ticker} />
      <Tiktoks ticker={params.ticker} />
    </div>
  );
}
