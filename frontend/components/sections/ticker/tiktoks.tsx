import Image from "next/image";

export default function Tiktoks({ ticker }: { ticker: string }) {
  return (
    <>
      <div className="flex justify-between sen my-12 items-center">
        <div className="flex flex-col ">
          <p className="text-2xl font-bold nouns tracking-widest text-[#F8D12E]">
            Curated Tiktoks
          </p>
          <p className="text-md text-muted-foreground font-semibold mb-6">
            All videos where ${ticker} was mentioned/talked about
          </p>
          <div className="grid grid-cols-4 gap-2">
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
            <Image
              src={"https://picsum.photos/300/500"}
              width={300}
              height={500}
              alt="tiktok"
              className="rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
            />
          </div>
        </div>
      </div>
    </>
  );
}
