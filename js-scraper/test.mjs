import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  const supabase = createClient(url, key);
  try {
    const { data, error } = await supabase
      .from("tokens")
      .select(
        `
        *,
        prices(
          price_usd,
          price_sol,
          trade_at
        ),
        mentions(
          tiktoks(username, thumbnail, url, created_at, views),
          count
        ),
        tweets(id, created_at, tweet, tweet_id)
      `
      )
      .eq("id", 136847)
      .eq("prices.is_latest", true)
      .single();

    console.log(data);
    console.log(data.prices);

    let requestBody;

    if (data.prices.length == 0)
      requestBody = JSON.stringify({
        query: `{
  Solana {
    DEXTrades(
      orderBy: { descending: Block_Time }
      where: {
        Instruction: {
          Program: {
            Address: {
              is: "${data.address}" 
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
}
`,
        variables: "{}",
      });
    else {
      const sincePriceFetch = new Date(data.prices[0].trade_at);
      sincePriceFetch.setSeconds(sincePriceFetch.getSeconds() + 1);
      requestBody = JSON.stringify({
        query: `{
  Solana {
    DEXTrades(
      orderBy: { descending: Block_Time }
      where: {
        Instruction: {
          Program: {
            Address: {
              is: "${data.address}"
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
        },
        Block: {
          Time: {
            since: "${sincePriceFetch.toISOString()}"
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
}
`,
        variables: "{}",
      });
    }

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/eap",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.BITQUERY_API_KEY,
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
      data: requestBody,
    };

    const response = await axios.request(config);
    if (response.data.data == null) {
      console.log("ERROR");
      console.log(response.data.errors[0].message);
    }
    const trades = response.data.data.Solana.DEXTrades;
    const insertData = trades.map((trade, i) => {
      return {
        token_id: data.id,
        price_sol: trade.Trade.Buy.Price,
        price_usd: trade.Trade.Buy.PriceInUSD,
        trade_at: trade.Block.Time,
        is_latest: i == 0,
      };
    });

    const { data: insertResponse, error: insertError } = await supabase
      .from("prices")
      .insert(insertData);
    if (insertError) {
      console.log(insertError);
      throw insertError;
    }
    console.log(insertResponse);
  } catch (e) {
    console.log(e);
  }
}

async function altMain() {
  const query = `{
  Solana {
    DEXTrades(
      orderBy: { descending: Block_Time }
      where: {
        Instruction: {
          Program: {
            Address: {
              is: "${"6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}" 
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

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/eap",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BITQUERY_API_KEY,
      Authorization: "Bearer " + process.env.ACCESS_TOKEN,
    },
    data: JSON.stringify({
      query: query,
      variables: "{}",
    }),
  };

  const response = await axios.request(config);
  if (!response.data || response.data.data.Solana.DEXTrades == null) {
    console.log("ERROR");
    console.log(response.data.errors[0].message);
  } else {
    console.log(JSON.stringify(response.data.data.Solana.DEXTrades, null, 2));
  }
}

altMain();
