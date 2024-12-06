"use client";
import { Separator } from "@/components/ui/separator";
import HeroTable from "./hero-table";
import MemecoinDashboard from "./dashboard";
import UnlockNow from "@/components/unlock-now";
import { useEnvironmentStore } from "@/components/context";
import MemecoinsTreemap from "./heat-treemap";

export default function Home() {
  const { paid } = useEnvironmentStore((store) => store);
  return (
    <div className="w-screen mx-auto">
      <p className="text-center nouns tracking-widest font-bold text-3xl text-[#F8D12E] mt-16">
        The Ultimate TikTok Memecoin Hunter
      </p>
      <p className="sen text-muted-foreground font-semibold  mt-2 text-center">
        Realtime tiktok analytics for memecoins. <br />
        Hunt the next moonshot 🚀
      </p>
      <div className="max-w-[1000px] mx-auto">
        <HeroTable />
      </div>
      {/* <MemecoinDashboard /> */}
      {/* <MemecoinsTreemap /> */}
      {!paid && <UnlockNow />}
    </div>
  );
}
