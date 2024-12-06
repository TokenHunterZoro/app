"use client";
import { Separator } from "@/components/ui/separator";
import HeroTable from "./hero-table";

export default function Home() {
  return (
    <div className="w-screen mx-auto">
      <p className="text-center nouns tracking-widest font-bold text-3xl text-[#F8D12E] mt-16">
        ZoroX: The Tiktok Memecoin Hunter
      </p>
      <div className="max-w-[1000px] mx-auto">
        <HeroTable />
      </div>
    </div>
  );
}
