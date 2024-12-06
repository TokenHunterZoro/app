"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HandHelping } from "lucide-react";
import { useEnvironmentStore } from "@/components/context";
import { CommandMenu } from "./command-menu";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { showConnectModal, showPayModal, showSupportModal } =
    useEnvironmentStore((store) => store);
  const router = useRouter();
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
          <Button className="bg-[#F8D12E] hover:bg-[#F8D12E] transform transition hover:scale-105">
            <Image
              src={"/phantom.jpg"}
              width={25}
              height={25}
              className="rounded-full"
              alt="phantom"
            />
            <p className="sen text-md font-bold ">Connect Phantom</p>
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
