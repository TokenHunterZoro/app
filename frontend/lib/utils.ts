import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  beforeOffsetTimestamp: string,
  afterOffsetTimestamp: string
) {
  console.log("mintAddress", mintAddress);
  console.log("beforeOffsetTimestamp", beforeOffsetTimestamp);
  console.log("afterOffsetTimestamp", afterOffsetTimestamp);
  if (beforeOffsetTimestamp.length > 0)
    return `{
  Solana {
    DEXTrades(
      limit: { count: 1 }
      orderBy: { descending: Block_Time }
      where: {
        Block: {
          Time: {
            after: "${afterOffsetTimestamp}"
            before: "${beforeOffsetTimestamp}"
          }
        },
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
  else
    return `{
  Solana {
    DEXTrades(
      limit: { count: 1 }
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
