"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEnvironmentStore } from "@/components/context";
import { CommandMenu } from "./command-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { shortenAddress } from "@/lib/utils";
// import getSub from "@/lib/supabase/getSub";
import fetchBalances from "@/lib/fetchBalances";
import mintFreeTestBonks from "@/lib/mintFreeTestBonks";
import { useToast } from "@/hooks/use-toast";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setVisible } = useWalletModal();
  const { disconnect, connected, publicKey } = useWallet();
  const { walletAddress, setAddress, setPaid, setBalances } =
    useEnvironmentStore((store) => store);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (walletAddress.length > 0) {
      fetch(`/api/supabase/get-sub?address=${walletAddress}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("EXPIRES");
          console.log(data.expires);
          if (data.expires) {
            if (new Date().getTime() <= data.expires) setPaid(true);
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
    <div className="w-full py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 space-y-4 sm:space-y-0">
        <div
          className="flex items-center space-x-3 sm:space-x-4 select-none cursor-pointer"
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
          <p className="font-bold text-lg sm:text-2xl nouns tracking-widest text-[#F8D12E]">
            ZoroX
          </p>
        </div>

        <CommandMenu />

        <div className="hidden md:flex space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            variant="ghost"
            className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
            onClick={async () => {
              if (!connected) {
                toast({
                  title: "Please connect your wallet first",
                  description:
                    "You need to connect your wallet to mint free Test Bonks",
                });
                return;
              }
              console.log("Minting free Test Bonks");
              toast({
                title: "Minting free Test Bonks",
                description: "Please wait for transaction confirmation...",
              });
              await mintFreeTestBonks(walletAddress);
              toast({
                title: "Transaction Successful",
                description: "Minted 500,000 Test Bonks",
              });
            }}
          >
            <p className="sen text-sm sm:text-md font-bold">
              Mint free Test Bonks
            </p>
            <Image
              src="/bonk.png"
              alt="logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </Button>

          <Button
            variant="ghost"
            className="hidden lg:flex hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
            onClick={() => {
              window.open("https://x.com/TokenHunterZoro", "_blank");
            }}
          >
            <p className="sen text-sm sm:text-md font-bold">Follow on</p>
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
            onClick={() => {
              if (!connected) setVisible(true);
              else disconnect();
            }}
          >
            <Image
              src={"/solana.png"}
              width={25}
              height={25}
              className="rounded-full"
              alt="phantom"
            />
            <p className="sen text-sm sm:text-md font-bold">
              {!connected
                ? "Connect Wallet"
                : shortenAddress(publicKey?.toString() ?? "")}
            </p>
          </Button>
        </div>
      </div>
      <div className="flex md:hidden mt-4 justify-center md:justify-start ">
        <Button
          variant="ghost"
          className="hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
          onClick={async () => {
            if (!connected) {
              toast({
                title: "Please connect your wallet first",
                description:
                  "You need to connect your wallet to mint free Test Bonks",
              });
              return;
            }
            console.log("Minting free Test Bonks");
            toast({
              title: "Minting free Test Bonks",
              description: "Please wait for transaction confirmation...",
            });
            await mintFreeTestBonks(walletAddress);
            toast({
              title: "Transaction Successful",
              description: "Minted 500,000 Test Bonks",
            });
          }}
        >
          <p className="sen text-sm sm:text-md font-bold">
            Mint free Test Bonks
          </p>
          <Image
            src="/bonk.png"
            alt="logo"
            width={20}
            height={20}
            className="rounded-full"
          />
        </Button>

        <Button
          variant="ghost"
          className="hidden lg:flex hover:bg-transparent hover:border-[1px] hover:border-white transform transition hover:scale-105"
          onClick={() => {
            window.open("https://x.com/TokenHunterZoro", "_blank");
          }}
        >
          <p className="sen text-sm sm:text-md font-bold">Follow on</p>
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
          onClick={() => {
            if (!connected) setVisible(true);
            else disconnect();
          }}
        >
          <Image
            src={"/solana.png"}
            width={25}
            height={25}
            className="rounded-full"
            alt="phantom"
          />
          <p className="sen text-sm sm:text-md font-bold">
            {!connected
              ? "Connect Wallet"
              : shortenAddress(publicKey?.toString() ?? "")}
          </p>
        </Button>
      </div>

      <div className="">{children}</div>
    </div>
  );
}
