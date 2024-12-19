import Image from "next/image";

export default function GraphPreview() {
  return (
    <div className="flex flex-col-reverse xl:flex-row justify-between w-full xl:w-[1200px] mx-auto">
      <div className="flex-1 my-auto mx-auto xl:mx-0">
        <Image src={`/graph.png`} width={900} height={400} alt="graph" />
      </div>
      <div className="xl:flex-1 flex flex-col xl:pb-12 flex-1 max-w-[70%] mx-auto">
        <p className="font-bold nouns tracking-widest text-3xl text-[#F8D12E] mt-24 text-center xl:text-right">
          Track Viral Posts with <br /> Market Impact
        </p>
        <p className="sen text-muted-foreground font-semibold xl:w-[80%] xl:ml-auto mt-2 mb-16 text-sm text-center sm:text-base  xl:text-right">
          See the direct correlation between TikTok engagement and price
          movements. Our analytics track how viral TikTok content drives
          memecoin performance, helping you spot potential moonshots before they
          take off.
        </p>
      </div>
    </div>
  );
}
