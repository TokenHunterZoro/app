"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HandHelping } from "lucide-react";
import { useEnvironmentStore } from "@/components/context";
import { CommandMenu } from "./command-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib/utils";
import getSub from "@/lib/supabase/getSub";
import fetchBalances from "@/lib/fetchBalances";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { walletAddress, setAddress, setPaid, setBalances } =
    useEnvironmentStore((store) => store);
  const router = useRouter();

  useEffect(() => {
    if (walletAddress.length > 0) {
      getSub(walletAddress).then((expires) => {
        console.log("EXPIRES");
        console.log(expires);
        if (expires) {
          if (new Date().getTime() <= expires) setPaid(true);
        }
      });
      fetchBalances(walletAddress).then((balances) => {
        console.log("BALANCES");
        console.log(balances);
        setBalances(balances.sol.toString(), balances.token.toString());
      });
    }
  }, [walletAddress]);
  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center px-6">
        <div
          className="flex items-center space-x-4 select-none cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
          <Image
            src="/logo.jpg"
            alt="logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <p className="font-bold text-2xl nouns tracking-widest text-[#F8D12E]">
            ZoroX
          </p>
        </div>
        <CommandMenu />
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
            onClick={() => {
              window.open("https://x.com/TokenHunterZoro", "_blank");
            }}
          >
            <p className="sen text-md font-bold ">Follow on</p>
            <Image
              src="/x.png"
              alt="logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </Button>
          <Button
            className="bg-[#F8D12E] hover:bg-[#F8D12E] transform transition hover:scale-105"
            onClick={async () => {
              if (walletAddress) {
                try {
                  const { solana } = (window as any).phantom;

                  if (solana) {
                    await solana.disconnect();
                    setAddress("");
                  }
                } catch (error) {
                  console.error(
                    "Error disconnecting from Phantom wallet:",
                    error
                  );
                }
              } else {
                try {
                  const { solana } = (window as any).phantom;

                  if (solana) {
                    const response = await solana.connect();
                    setAddress(response.publicKey.toString());
                  }
                } catch (error) {
                  console.error("Error connecting to Phantom wallet:", error);
                }
              }
            }}
          >
            <Image
              src={"/phantom.jpg"}
              width={25}
              height={25}
              className="rounded-full"
              alt="phantom"
            />
            <p className="sen text-md font-bold ">
              {walletAddress == ""
                ? "Connect Phantom"
                : shortenAddress(walletAddress)}
            </p>
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
