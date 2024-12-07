import Ticker from "@/components/sections/ticker";

export default function Page({ params }: { params: { ticker: string } }) {
  return <Ticker params={params} />;
}
