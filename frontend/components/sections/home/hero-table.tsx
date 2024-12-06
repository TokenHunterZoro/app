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
import { useState } from "react";
import SortableTableHeader from "./hero-table/sortable-table-header";
import { DUMMY_HERO_TABLE_DATA, ITEMS_PER_PAGE } from "@/lib/constants";
import { SortConfig, SortKey, TokenData } from "@/lib/types";
import TableWrapper from "./hero-table/wrapper";
import { useEnvironmentStore } from "@/components/context";

export default function HeroTable() {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(DUMMY_HERO_TABLE_DATA.length / ITEMS_PER_PAGE);

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
  return (
    <>
      <TableWrapper showWrapper={!paid}>
        <Table className="w-full border mt-8">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableTableHeader
                onClick={() => handleSort("position")}
                sorted={sortConfig.key === "position"}
                direction={sortConfig.direction}
              >
                #
              </SortableTableHeader>
              <SortableTableHeader
                onClick={() => handleSort("ticker")}
                sorted={sortConfig.key === "ticker"}
                direction={sortConfig.direction}
              >
                TOKEN
              </SortableTableHeader>
              <SortableTableHeader
                onClick={() => handleSort("price")}
                sorted={sortConfig.key === "price"}
                direction={sortConfig.direction}
              >
                PRICE
              </SortableTableHeader>
              <SortableTableHeader
                onClick={() => handleSort("age")}
                sorted={sortConfig.key === "age"}
                direction={sortConfig.direction}
              >
                AGE
              </SortableTableHeader>
              <SortableTableHeader
                onClick={() => handleSort("volume")}
                sorted={sortConfig.key === "volume"}
                direction={sortConfig.direction}
              >
                VOLUME
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
                onClick={() => handleSort("marketCap")}
                sorted={sortConfig.key === "marketCap"}
                direction={sortConfig.direction}
              >
                MCAP
              </SortableTableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((coin: any) => (
              <TableRow
                key={coin.position}
                className="cursor-pointer"
                onClick={() => {
                  router.push(`/token/${coin.ticker}`);
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
      </TableWrapper>

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
