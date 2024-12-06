interface TokenData {
  position: number;
  ticker: string;
  price: number;
  age: string;
  volume: number;
  views: number;
  mentions: number;
  marketCap: number;
  image: string;
}

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
  SortKey,
  SortDirection,
  SortConfig,
  SortableTableHeaderProps,
};
