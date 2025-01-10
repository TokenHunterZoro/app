import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DataPoint, TimeframeType, TradeData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function toKebabCase(str: string) {
  return str
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove any non-alphanumeric characters except hyphens
    .replace(/-+/g, "-") // Replace multiple consecutive hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove hyphens from start and end
}
interface TimeUnits {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
  months: number;
  years: number;
}

export function getTimeAgo(timestamp: string): string {
  const now: Date = new Date();
  const past: Date = new Date(timestamp);
  const diffInMs: number = now.getTime() - past.getTime();
  const times: TimeUnits = {
    seconds: Math.floor(diffInMs / 1000),
    minutes: Math.floor(diffInMs / (1000 * 60)),
    hours: Math.floor(diffInMs / (1000 * 60 * 60)),
    days: Math.floor(diffInMs / (1000 * 60 * 60 * 24)),
    months: Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365)),
  };

  if (times.years > 0) {
    return `${times.years}y ago`;
  } else if (times.months > 0) {
    return `${times.months}mo ago`;
  } else if (times.days > 0) {
    return `${times.days}d ago`;
  } else if (times.hours > 0) {
    return `${times.hours}h ago`;
  } else if (times.minutes > 0) {
    return `${times.minutes}m ago`;
  } else if (times.seconds > 0) {
    return `${times.seconds}s ago`;
  } else {
    return "Just now";
  }
}

export function formatMarketcap(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  const units = ["", " K", " M", " B"];
  const divisor = 1000;
  const exponent = Math.floor(Math.log(num) / Math.log(divisor));
  const value = (num / Math.pow(divisor, exponent)).toFixed(2);

  // Remove trailing zeros after decimal
  const formatted = parseFloat(value).toString();

  return formatted + units[exponent];
}

export function getQuery(
  mintAddress: string,
  isLatest: boolean,
  offset: number = 0
) {
  console.log("mintAddress", mintAddress);
  console.log("isLatest", isLatest);
  console.log("offset", offset);

  if (!isLatest) {
    return `{
  Solana {
    DEXTrades(
      limit: { count: 1, offset: ${offset} }
      orderBy: { ascending: Block_Time }
      where: {
        Instruction: {
          Program: {
            Address: {
              is: "${mintAddress}" 
            }
          }
        },
        Trade: {
          Dex: {
            ProtocolName: {
              is: "pump"
            }
          },
          Buy: {
            Currency: {
              MintAddress: {
                notIn: ["11111111111111111111111111111111"]
              }
            }
          }
        },
        Transaction: {
          Result: {
            Success: true
          }
        }
      }
    ) {
      Trade {
        Buy {
          Price
          PriceInUSD
        }
      }
      Block {
        Time
      }
    }
  }
}`;
  } else {
    return `{
  Solana {
    DEXTrades(
      limit: { count: 1, offset: ${offset} }
      orderBy: { descending: Block_Time }
      where: {
        Instruction: {
          Program: {
            Address: {
              is: "${mintAddress}" 
            }
          }
        },
        Trade: {
          Dex: {
            ProtocolName: {
              is: "pump"
            }
          },
          Buy: {
            Currency: {
              MintAddress: {
                notIn: ["11111111111111111111111111111111"]
              }
            }
          }
        },
        Transaction: {
          Result: {
            Success: true
          }
        }
      }
    ) {
      Trade {
        Buy {
          Price
          PriceInUSD
        }
      }
      Block {
        Time
      }
    }
  }
}`;
  }
}

export const processTradeData = (
  trades: TradeData[],
  startMentions: number,
  endMentions: number,
  views: number,
  timeframe: TimeframeType
): DataPoint[] => {
  const now = Date.now();
  const timeframeLimit = {
    "30m": 1000 * 60 * 30,
    "1h": 1000 * 60 * 60,
    "3h": 1000 * 60 * 60 * 3,
    "24h": 1000 * 60 * 60 * 24,
    "7d": 1000 * 60 * 60 * 24 * 7,
  }[timeframe];

  const cutoffTime = now - timeframeLimit;
  // Filter trades within the timeframe and sort by timestamp
  const filteredTrades = trades
    .filter((trade) => new Date(trade.trade_at).getTime() >= cutoffTime)
    .sort(
      (a, b) => new Date(a.trade_at).getTime() - new Date(b.trade_at).getTime()
    );

  const returnData = filteredTrades.map((trade, index) => {
    const tradeDate = new Date(trade.trade_at);

    return {
      timestamp: formatTimestamp(trade.trade_at, timeframe),
      rawTimestamp: tradeDate.getTime(),
      price: trade.price_usd,
      popularity: calculatePopularityAtTimestamp(
        startMentions,
        new Date(filteredTrades[0].trade_at).getTime(),
        endMentions,
        new Date(filteredTrades[filteredTrades.length - 1].trade_at).getTime(),
        views,
        tradeDate.getTime()
      ),
    };
  });
  console.log("RETURN DATA");
  console.log(returnData);
  // Calculate popularity for each point
  return returnData;
};

export function calculatePopularityAtTimestamp(
  mentionsStart: number,
  timestampStart: number,
  mentionsEnd: number,
  timestampEnd: number,
  views: number,
  targetTimestamp: number,
  weightMentions: number = 0.7,
  weightViews: number = 0.3,
  decayRate: number = 0.00001
): number {
  // Calculate time-based metrics
  const timeElapsed = targetTimestamp - timestampStart;
  const totalTimespan = timestampEnd - timestampStart;

  // Calculate mentions rate and interpolation
  const mentionsRate = (mentionsEnd - mentionsStart) / totalTimespan;
  const interpolatedMentions = mentionsStart + mentionsRate * timeElapsed;

  // Normalize views (cap at 10M)
  const normalizedViews = Math.min(views / 10000000, 1);

  // Calculate base popularity
  let popularity =
    interpolatedMentions * weightMentions + normalizedViews * weightViews;

  // Apply gradual decay
  const decayFactor = 1 / (1 + decayRate * timeElapsed);
  popularity *= decayFactor;

  // Boost for increasing mentions
  if (mentionsRate > 0) {
    const growthFactor = 1 + Math.min(mentionsRate * 100, 0.5); // Cap growth at 50%
    popularity *= growthFactor;
  }

  // Ensure minimum value
  return Math.max(popularity, 0.01);
}

export const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
export function formatFloatingNumber(number: number) {
  if (number === 0) return "0.000"; // Special case for zero

  const absNumber = Math.abs(number);
  const decimalPlaces = Math.max(0, 3 - Math.floor(Math.log10(absNumber)));

  // Round the number to the desired precision
  const rounded = Number(absNumber.toFixed(decimalPlaces));

  // Return the number, keeping the sign
  return (number < 0 ? -rounded : rounded).toString();
}

export const formatTimestamp = (
  timestamp: string,
  timeframe: TimeframeType
): string => {
  const date = new Date(timestamp);

  switch (timeframe) {
    case "30m":
    case "1h":
    case "3h":
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    case "24h":
      return `${String(date.getHours()).padStart(2, "0")}:00`;
    case "7d":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    default:
      return timestamp;
  }
};
