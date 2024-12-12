import Image from "next/image";
import UnlockNow from "@/components/unlock-now";
import { useEnvironmentStore } from "@/components/context";
import { pumpfunSample } from "@/lib/constants";
import { TokenData } from "@/lib/types";

export default function Tiktoks({ tokenData }: { tokenData: TokenData }) {
  const { paid } = useEnvironmentStore((store) => store);
  return (
    <>
      <div className="flex justify-between sen my-12 items-center">
        <div className="flex flex-col w-full">
          <p className="text-2xl font-bold nouns tracking-widest text-[#F8D12E]">
            Curated Tiktoks
          </p>
          <p className="text-md text-muted-foreground font-semibold mb-6">
            All videos where ${tokenData.symbol.toUpperCase()} was
            mentioned/talked about.
          </p>
          <div className="relative">
            <div className="grid grid-cols-4 gap-2">
              {pumpfunSample.results.pumpfun.videos
                .slice(
                  0,
                  paid ? pumpfunSample.results.pumpfun.videos.length : 4
                )
                .map((video, i) => {
                  return (
                    <div
                      onClick={() => window.open(video.video_url, "_blank")}
                      className="cursor-pointer relative w-[300px] h-[500px] rounded-xl border border-[2px] border-secondary hover:border-muted-foreground transition duration-300 ease-in-out"
                      key={i}
                    >
                      <img
                        src={video.thumbnail_url}
                        alt="tiktok"
                        className="w-[300px] h-[496px] rounded-xl"
                      />
                      <div className=" absolute inset-0 flex flex-col justify-between p-4 text-white">
                        {/* Top Info (Posted Time and Author Info) */}
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              video.author.length == 0
                                ? "https://picsum.photos/300/50" + i
                                : video.author
                            }
                            alt={video.author}
                            className="w-10 h-10 rounded-full border border-white"
                          />
                          <div>
                            <p className="font-semibold">
                              {video.author == ""
                                ? "the.chill.guy"
                                : video.author}
                            </p>
                            <p className="text-sm text-gray-300">
                              {video.posted_time}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Info (Description and Comments Count) */}
                        <div>
                          <p className="text-sm line-clamp-2">
                            {video.description}
                          </p>
                          <p className="mt-2 text-sm font-semibold">
                            {video.comments.count} comments
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {/* <Image
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
              )} */}
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

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary rounded-lg ">
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
