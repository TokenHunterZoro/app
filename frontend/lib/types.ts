type Price = {
  price_usd: number;
  price_sol: number;
  trade_at: string;
  is_latest: boolean;
};

type SearchTokenResponse = {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  image: any;
};

type TokenData = {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  image: any;
  created_at: string;
  address: string;
  prices: Price[];
  latest_price_usd: number | null;
  latest_price_sol: number | null;
  latest_market_cap: number | null;
  views: number;
  mentions: number;
  tweets: any[];
  tiktoks: any[];
};

type LeaderboardData = {
  id: number;
  name: string;
  symbol: string;
  uri: string;
  image: any;
  created_at: string;
  latest_price_usd: number | null;
  latest_market_cap: number | null;
  latest_price_sol: number | null;
  views: number;
  mentions: number;
};
type SortKey = keyof TokenData;
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

interface SortableTableHeaderProps {
  children: React.ReactNode;
  onClick: () => void;
  sorted: boolean;
  direction: SortDirection;
}

export interface DocsConfig {
  mainNav: any[];
  sidebarNav: any[];
  chartsNav: any[];
}

interface TradeData {
  price_usd: number;
  price_sol: number;
  trade_at: string;
}

interface DataPoint {
  timestamp: string;
  rawTimestamp: number;
  price: number;
  popularity: number;
}

type TimeframeType = "30m" | "1h" | "3h" | "24h" | "7d";
export type {
  TokenData,
  Price,
  SortKey,
  SortDirection,
  SortConfig,
  SortableTableHeaderProps,
  SearchTokenResponse,
  LeaderboardData,
  TradeData,
  DataPoint,
  TimeframeType,
};
