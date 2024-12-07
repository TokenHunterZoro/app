export default function Tiktoks({ ticker }: { ticker: string }) {
  return (
    <>
      <div className="flex justify-between sen my-12 items-center">
        <div className="flex flex-col ">
          <p className="text-2xl font-bold nouns tracking-widest text-[#F8D12E]">
            Curated Tiktoks
          </p>
          <p className="text-md text-muted-foreground font-semibold">
            All videos where ${ticker} was mentioned/talked about
          </p>
        </div>
      </div>
    </>
  );
}
