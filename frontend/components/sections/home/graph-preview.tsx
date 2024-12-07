import Image from "next/image";

export default function GraphPreview() {
  return (
    <div className="flex justify-between w-[1200px] mx-auto">
      <div className="flex-1 my-auto">
        <Image src={`/graph.png`} width={900} height={400} alt="graph" />
      </div>
      <div className="flex flex-col pb-12 flex-1">
        <p className="font-bold nouns tracking-widest text-3xl text-[#F8D12E] mt-24 text-right">
          Track Viral Posts with <br /> Market Impact
        </p>
        <p className="sen text-muted-foreground font-semibold  mt-2 mb-16 max-w-[70%] ml-auto text-right">
          See the direct correlation between TikTok engagement and price
          movements. Our analytics track how viral TikTok content drives
          memecoin performance, helping you spot potential moonshots before they
          take off.
        </p>
      </div>
    </div>
  );
}
