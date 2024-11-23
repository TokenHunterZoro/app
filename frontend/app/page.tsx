import TikTokVideoGrid from "@/components/Grid";
import { pumpfunSample } from "@/lib/constants";
import Image from "next/image";

export default function Home() {
  return <TikTokVideoGrid videos={pumpfunSample.data.videos} />;
}
