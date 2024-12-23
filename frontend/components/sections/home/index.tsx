"use client";
import { Separator } from "@/components/ui/separator";
import HeroTable from "./hero-table";
import UnlockNow from "@/components/unlock-now";
import { useEnvironmentStore } from "@/components/context";
import TimeSeriesChart from "../ticker/time-series-chart";
import TiktokSection from "./tiktok";
import GraphPreview from "./graph-preview";

export default function Home() {
  const { paid } = useEnvironmentStore((store) => store);
  return (
    <div className="w-full">
      <p className="text-center nouns tracking-widest font-bold  text-2xl md:text-3xl text-[#F8D12E] mt-6 md:mt-16">
        The Ultimate TikTok Memecoin Hunter
      </p>
      <p className="sen text-muted-foreground font-semibold  mt-2 text-center text-xs sm:text-sm md:text-base">
        Realtime tiktok analytics for memecoins. <br />
        Hunt the next moonshot 🚀
      </p>
      <div className="max-w-[1200px] mx-auto">
        <HeroTable />
      </div>
      {!paid && <UnlockNow text="View the realtime dashboard" />}
      {/* <TimeSeriesChart /> */}
      <TiktokSection />
      <GraphPreview />
      <Separator className="my-8" />
      {!paid && <UnlockNow text="Unlock All ZoroX features now" />}
      <div className="my-12" />
    </div>
  );
}
