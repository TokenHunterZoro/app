"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SortableTableHeader from "./hero-table/sortable-table-header";
import { DUMMY_HERO_TABLE_DATA, ITEMS_PER_PAGE } from "@/lib/constants";
import { SortConfig, SortKey, TokenData } from "@/lib/types";
import TableWrapper from "./hero-table/wrapper";
import { useEnvironmentStore } from "@/components/context";
import getMemecoins from "@/lib/supabase/getMemecoins";
import { formatMarketcap, getTimeAgo, toKebabCase } from "@/lib/utils";
import Image from "next/image";
import getCount from "@/lib/supabase/getCount";

export default function HeroTable() {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [memecoinData, setMemecoinData] = useState<any[]>([]);
  const { setLeaderboad, leaderboard } = useEnvironmentStore((store) => store);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return DUMMY_HERO_TABLE_DATA.slice(startIndex, endIndex);
  };

  const pageData = getCurrentPageData();

  const { paid } = useEnvironmentStore((store) => store);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    (async function () {
      setMemecoinData([]);
      console.log("FETCHING DATA");

      const dataCount = await getCount();
      setTotalPages(Math.ceil((dataCount || ITEMS_PER_PAGE) / ITEMS_PER_PAGE));
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const tempMemecoins = (await getMemecoins(startIndex)) as any[];
      setMemecoinData(tempMemecoins);
      if (currentPage == 1 && leaderboard.length == 0)
        setLeaderboad(tempMemecoins);
    })();
  }, [currentPage]);
  return (
    <>
      {memecoinData.length == 0 ? (
        <div className="w-[1000px] mx-auto mt-12 mb-24">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <TableWrapper showWrapper={!paid}>
          <Table className="w-full border mt-8">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <SortableTableHeader
                  onClick={() => handleSort("id")}
                  sorted={sortConfig.key === "id"}
                  direction={sortConfig.direction}
                >
                  #
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("symbol")}
                  sorted={sortConfig.key === "symbol"}
                  direction={sortConfig.direction}
                >
                  TOKEN
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("latest_price_usd")}
                  sorted={sortConfig.key === "latest_price_usd"}
                  direction={sortConfig.direction}
                >
                  PRICE IN USD
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("latest_price_sol")}
                  sorted={sortConfig.key === "latest_price_sol"}
                  direction={sortConfig.direction}
                >
                  PRICE IN SOL
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("created_at")}
                  sorted={sortConfig.key === "created_at"}
                  direction={sortConfig.direction}
                >
                  AGE
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("views")}
                  sorted={sortConfig.key === "views"}
                  direction={sortConfig.direction}
                >
                  VIEWS
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("mentions")}
                  sorted={sortConfig.key === "mentions"}
                  direction={sortConfig.direction}
                >
                  MENTIONS
                </SortableTableHeader>
                <SortableTableHeader
                  onClick={() => handleSort("latest_market_cap")}
                  sorted={sortConfig.key === "latest_market_cap"}
                  direction={sortConfig.direction}
                >
                  MCAP
                </SortableTableHeader>
              </TableRow>
            </TableHeader>

            <TableBody>
              {memecoinData.map((coin: TokenData, idx: number) => (
                <TableRow
                  key={coin.id}
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(`/token/${coin.id}`);
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <Image
                      src={coin.image}
                      alt={coin.symbol}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{(coin.symbol as string).toLocaleUpperCase()}</span>
                  </TableCell>
                  <TableCell>
                    {coin.latest_price_usd
                      ? coin.latest_price_usd.toFixed(10)
                      : "0.00"}
                  </TableCell>
                  <TableCell>
                    {coin.latest_price_sol
                      ? coin.latest_price_sol.toFixed(10)
                      : "0.00"}
                  </TableCell>
                  <TableCell>{getTimeAgo(coin.created_at)}</TableCell>
                  <TableCell>{coin.views || 0}</TableCell>
                  <TableCell>{coin.mentions || 0}</TableCell>
                  <TableCell>
                    {formatMarketcap(coin.latest_market_cap || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      )}

      {paid && (
        <div className="flex justify-between items-center mt-4 px-4">
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
