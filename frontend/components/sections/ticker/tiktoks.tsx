import Image from "next/image";
import UnlockNow from "@/components/unlock-now";
import { useEnvironmentStore } from "@/components/context";

export default function Tiktoks({ ticker }: { ticker: string }) {
  const { paid } = useEnvironmentStore((store) => store);
  return (
    <>
      <div className="flex justify-between sen my-12 items-center">
        <div className="flex flex-col w-full">
          <p className="text-2xl font-bold nouns tracking-widest text-[#F8D12E]">
            Curated Tiktoks
          </p>
          <p className="text-md text-muted-foreground font-semibold mb-6">
            All videos where ${ticker} was mentioned/talked about
          </p>
          <div className="relative">
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
              {paid && (
                <>
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
                </>
              )}
            </div>

            {!paid && (
              <>
                {/* Gradient overlay for first row */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black rounded-xl backdrop-blur-[2px]" />

                {/* Hide subsequent rows with solid overlay */}
                <div className="absolute top-[500px] left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm rounded-xl">
                  <div className="grid grid-cols-4 gap-2 invisible">
                    <Image
                      src={"https://picsum.photos/300/500"}
                      width={300}
                      height={500}
                      alt="tiktok"
                      className="rounded-xl"
                    />
                    <Image
                      src={"https://picsum.photos/300/500"}
                      width={300}
                      height={500}
                      alt="tiktok"
                      className="rounded-xl"
                    />
                    <Image
                      src={"https://picsum.photos/300/500"}
                      width={300}
                      height={500}
                      alt="tiktok"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <UnlockNow text="Unlock all TikToks" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
