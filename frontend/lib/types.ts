type Price = {
  price_usd: number;
  price_sol: number;
  created_at: string;
  is_latest: boolean;
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
  latest_price_usd: number;
  latest_market_cap: number;
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
export type {
  TokenData,
  Price,
  SortKey,
  SortDirection,
  SortConfig,
  SortableTableHeaderProps,
};
