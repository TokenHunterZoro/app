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
import React, { useEffect, useMemo, useState } from "react";
import SortableTableHeader from "./sortable-table-header";
import {
  IPFS_GATEWAY_URL,
  IPFS_GATEWAY_URL_4,
  ITEMS_PER_PAGE,
} from "@/lib/constants";
import { LeaderboardData, SortConfig, SortKey, TokenData } from "@/lib/types";
import TableWrapper from "./wrapper";
import { useEnvironmentStore } from "@/components/context";
import { formatMarketcap, getTimeAgo, toKebabCase } from "@/lib/utils";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { ChevronDown } from "lucide-react";

export default function HeroTable() {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesFetched, setImagesFetched] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const { setLeaderboard, leaderboard, paid } = useEnvironmentStore(
    (store) => store
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    let isMounted = true;

    (async function () {
      if (!isMounted) return;
      setLeaderboard([]);
      console.log("FETCHING DATA");

      try {
        const countResponse = await fetch("/api/supabase/get-count");
        const countData = await countResponse.json();
        const dataCount = countData.count;

        if (!isMounted) return;
        setTotalPages(
          Math.ceil((dataCount || ITEMS_PER_PAGE) / ITEMS_PER_PAGE)
        );

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const memecoinsResponse = await fetch(
          `/api/supabase/get-memecoins?start=${startIndex}`
        );

        const tempMemecoins = await memecoinsResponse.json();
        if (tempMemecoins.error) {
          console.log("ERROR FETCHING MEMECOINS");
          return;
        }

        if (!isMounted) return;
        setLeaderboard(tempMemecoins);
        setImagesFetched(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentPage, setLeaderboard]);

  useEffect(() => {
    if (leaderboard.length > 0 && !imagesFetched) {
      Promise.all(
        leaderboard.map(async (coin) => {
          console.log(coin.uri);
          const metadataResponse = await fetch(
            IPFS_GATEWAY_URL + coin.uri.split("/").at(-1)
          );
          const metadata = await metadataResponse.json();
          coin.image = IPFS_GATEWAY_URL + metadata.image.split("/").at(-1);
        })
      ).then(() => {
        setImagesFetched(true);
      });
    }
  }, [imagesFetched, leaderboard]);
  const groupedTokens = useMemo(() => {
    const groups: Record<string, LeaderboardData[]> = {};
    leaderboard.forEach((token) => {
      const symbol = token.symbol.toUpperCase();
      if (!groups[symbol]) {
        groups[symbol] = [];
      }
      groups[symbol].push(token);
    });
    return groups;
  }, [leaderboard]);
  const getGroupRepresentative = (tokens: LeaderboardData[]) => {
    return tokens.reduce((prev, current) =>
      (current.latest_market_cap || 0) > (prev.latest_market_cap || 0)
        ? current
        : prev
    );
  };

  const toggleGroup = (symbol: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  return (
    <>
      {leaderboard.length == 0 ? (
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
              {Object.entries(groupedTokens).map(([symbol, tokens]) => (
                <React.Fragment key={symbol}>
                  {/* Group Header Row */}
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleGroup(symbol)}
                  >
                    <TableCell>
                      {tokens.length > 1 ? (
                        expandedGroups.has(symbol) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      ) : (
                        <span className="w-4" />
                      )}
                    </TableCell>
                    <TableCell className="flex items-center space-x-2">
                      {imagesFetched ? (
                        <Image
                          src={
                            getGroupRepresentative(tokens).image ||
                            "/solana.png"
                          }
                          alt={symbol}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                      )}
                      <div>
                        <span className="font-medium">{symbol}</span>
                        {tokens.length > 1 && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({tokens.length} tokens)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      $
                      {getGroupRepresentative(tokens).latest_price_usd?.toFixed(
                        10
                      ) || "0.00"}
                    </TableCell>
                    <TableCell>
                      ◎
                      {getGroupRepresentative(tokens).latest_price_sol?.toFixed(
                        10
                      ) || "0.00"}
                    </TableCell>
                    <TableCell>
                      {getTimeAgo(getGroupRepresentative(tokens).created_at)}
                    </TableCell>
                    <TableCell>
                      {tokens.reduce((sum, t) => sum + (t.views || 0), 0)}
                    </TableCell>
                    <TableCell>
                      {tokens.reduce((sum, t) => sum + (t.mentions || 0), 0)}
                    </TableCell>
                    <TableCell>
                      {formatMarketcap(
                        tokens.reduce(
                          (sum, t) => sum + (t.latest_market_cap || 0),
                          0
                        )
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Expanded Group Rows */}
                  {expandedGroups.has(symbol) &&
                    tokens.length > 1 &&
                    tokens.map((token, idx) => (
                      <TableRow
                        key={token.id}
                        className="cursor-pointer bg-muted/20 hover:bg-muted/30"
                        onClick={() => router.push(`/token/${token.id}`)}
                      >
                        <TableCell />
                        <TableCell className="flex items-center space-x-2 pl-8">
                          {imagesFetched ? (
                            <Image
                              src={token.image || "/solana.png"}
                              alt={token.symbol}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {token.symbol}
                          </span>
                        </TableCell>
                        <TableCell>
                          ${token.latest_price_usd?.toFixed(10) || "0.00"}
                        </TableCell>
                        <TableCell>
                          ◎{token.latest_price_sol?.toFixed(10) || "0.00"}
                        </TableCell>
                        <TableCell>{getTimeAgo(token.created_at)}</TableCell>
                        <TableCell>{token.views || 0}</TableCell>
                        <TableCell>{token.mentions || 0}</TableCell>
                        <TableCell>
                          {formatMarketcap(token.latest_market_cap || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
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
            NextNext
          </Button>
        </div>
      )}
    </>
  );
}
