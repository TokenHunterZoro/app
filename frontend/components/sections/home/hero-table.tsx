"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroTable() {
  const router = useRouter();
  const ITEMS_PER_PAGE = 7;

  const data = [
    {
      position: 1,
      image: "https://via.placeholder.com/40",
      ticker: "SAMO",
      price: "$0.0021",
      age: "11hr",
      volume: "$21.0M",
      views: "2.5k",
      mentions: "100k",
      marketCap: "$50.2M",
    },
    {
      position: 2,
      image: "https://via.placeholder.com/40",
      ticker: "DOGE",
      price: "$0.0013",
      age: "2d",
      volume: "$10.4M",
      views: "1.8k",
      mentions: "80k",
      marketCap: "$30.1M",
    },
    {
      position: 3,
      image: "https://via.placeholder.com/40",
      ticker: "INU",
      price: "$0.0009",
      age: "3d",
      volume: "$5.2M",
      views: "1.2k",
      mentions: "60k",
      marketCap: "$15.0M",
    },
    {
      position: 4,
      image: "https://via.placeholder.com/40",
      ticker: "KISHU",
      price: "$0.0001",
      age: "5hr",
      volume: "$3.7M",
      views: "950",
      mentions: "45k",
      marketCap: "$10.5M",
    },
    {
      position: 5,
      image: "https://via.placeholder.com/40",
      ticker: "ELON",
      price: "$0.0004",
      age: "1d",
      volume: "$7.1M",
      views: "1.3k",
      mentions: "70k",
      marketCap: "$25.8M",
    },
    {
      position: 6,
      image: "https://via.placeholder.com/40",
      ticker: "CINU",
      price: "$0.0029",
      age: "3hr",
      volume: "$15.4M",
      views: "2.9k",
      mentions: "110k",
      marketCap: "$40.3M",
    },
    {
      position: 7,
      image: "https://via.placeholder.com/40",
      ticker: "HOGE",
      price: "$0.0017",
      age: "12hr",
      volume: "$4.9M",
      views: "1.7k",
      mentions: "55k",
      marketCap: "$18.6M",
    },
    {
      position: 8,
      image: "https://via.placeholder.com/40",
      ticker: "SHIB",
      price: "$0.0007",
      age: "2d",
      volume: "$12.0M",
      views: "3.2k",
      mentions: "150k",
      marketCap: "$60.4M",
    },
    {
      position: 9,
      image: "https://via.placeholder.com/40",
      ticker: "FLOKI",
      price: "$0.0032",
      age: "8hr",
      volume: "$8.5M",
      views: "1.6k",
      mentions: "90k",
      marketCap: "$22.7M",
    },
    {
      position: 10,
      image: "https://via.placeholder.com/40",
      ticker: "PEPE",
      price: "$0.0005",
      age: "4d",
      volume: "$6.8M",
      views: "1.1k",
      mentions: "65k",
      marketCap: "$14.9M",
    },
  ];
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const pageData = getCurrentPageData();

  const [paid, setPaid] = useState(false);

  return (
    <>
      <div className="relative max-h-[400px] overflow-hidden text-white">
        <Table className="w-full border mt-10">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>#</TableHead>
              <TableHead>TOKEN</TableHead>
              <TableHead>PRICE</TableHead>
              <TableHead>AGE</TableHead>
              <TableHead>VOLUME</TableHead>
              <TableHead>VIEWS</TableHead>
              <TableHead>MENTIONS</TableHead>
              <TableHead>MCAP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((coin) => (
              <TableRow
                key={coin.position}
                className="cursor-pointer"
                onClick={() => {
                  router.push("/token/" + coin.ticker);
                }}
              >
                <TableCell>{coin.position}</TableCell>
                <TableCell className="flex items-center space-x-2">
                  <img
                    src={coin.image}
                    alt={coin.ticker}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{coin.ticker}</span>
                </TableCell>
                <TableCell>{coin.price}</TableCell>
                <TableCell>{coin.age}</TableCell>
                <TableCell>{coin.volume}</TableCell>
                <TableCell>{coin.views}</TableCell>
                <TableCell>{coin.mentions}</TableCell>
                <TableCell>{coin.marketCap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none"></div>
      </div>
      {!paid && (
        <div className="w-full flex flex-col justify-center items-center">
          <p className="sen text-muted-foreground font-semibold mt-6 mb-2">
            Unlock all features at just 0.1 SOL/week
          </p>
          <Separator className="w-[300px] mb-3 border-muted-foreground" />
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
      )}
      {paid && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
