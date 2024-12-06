import Image from "next/image";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useEnvironmentStore } from "./context";

export default function UnlockNow() {
  const { setPaid } = useEnvironmentStore((store) => store);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <p className="sen text-muted-foreground font-semibold mt-6 mb-2 text-center">
        View full dashboard and unlock all features
        <div className="flex  justify-center items-center">
          <p>at 0.1&nbsp;</p>
          <Image src={"/solana.png"} width={25} height={25} alt="solana" />
          <p>SOL</p>
          <p>/week</p>
        </div>
      </p>
      <Separator className="w-[180px] mb-3 border-muted-foreground" />
      <Button
        className="flex bg-[#F8D12E] hover:bg-[#F8D12E] transform transition hover:scale-105"
        onClick={() => {
          setPaid(true);
        }}
      >
        <Image
          src={"/phantom.jpg"}
          width={25}
          height={25}
          className="rounded-full"
          alt="phantom"
        />
        <p className="sen font-semibold text-md">Pay with Phantom</p>{" "}
      </Button>
    </div>
  );
}
