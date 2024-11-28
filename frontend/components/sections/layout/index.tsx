import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HandHelping } from "lucide-react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 select-none">
          <Image
            src="/logo.jpg"
            alt="logo"
            width={60}
            height={60}
            className="rounded-full"
          />
          <p className="font-bold text-4xl nouns tracking-widest text-[#F8D12E]">
            ZoroX
          </p>
        </div>
        <div className="flex space-x-4">
          <Button variant="ghost" className="hover:bg-white hover:text-black">
            <HandHelping className="h-24 w-24" />
            <p className="sen text-lg">Support us</p>
          </Button>
          <Button className="bg-[#F8D12E]">
            <p className="sen text-lg font-bold">Follow on</p>
            <Image
              src="/x.png"
              alt="logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </Button>
        </div>
      </div>

      {children}
    </div>
  );
}
