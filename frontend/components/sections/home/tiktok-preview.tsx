export default function TiktokPreview() {
  return (
    <div className="relative w-full mt-16">
      <div className="absolute w-full h-8 top-0 bg-gradient-to-b from-black/80 to-transparent" />
      <div className=" bg-muted-foreground transition duration-300 ease-in-out group hover:bg-[#F8D12E]">
        <div className="flex justify-between w-[1200px] mx-auto">
          <div className="flex-1 flex flex-col pb-12">
            <p className="font-bold nouns tracking-widest text-3xl text-black mt-24">
              Curated Memecoin Feed <br /> From Tiktok
            </p>
            <p className="group-hover:text-secondary sen text-accent font-semibold  mt-2 mb-16 max-w-[70%]">
              Track trending memecoins across TikTok influencers in real-time.
              Get instant alerts on viral coins before they moon, with key
              metrics like view count, engagement, and price impact.
            </p>
          </div>
          <div className="flex-1"></div>
        </div>
      </div>
      <div className="absolute w-full h-8 bottom-0 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}
