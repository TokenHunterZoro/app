import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();

    if (!tokenId) {
      console.error("Token ID is missing in the request.");
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching data for token ID: ${tokenId}`);
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_ANON_SECRET || ""
    );

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
      .eq("id", parseInt(tokenId))
      .eq("prices.is_latest", true)
      .single();

    if (error) {
      console.error("Error fetching token data:", error);
      return NextResponse.json(
        { error: "Failed to fetch token data" },
        { status: 500 }
      );
    }

    console.log("Token data fetched successfully:", data);
    let requestBody;

    if (data.prices.length == 0) {
      console.log("No prices found, preparing to fetch trades.");
      requestBody = JSON.stringify({
        query: `{
  Solana {
    DEXTrades(
      orderBy: { descending: Block_Time }
      limitBy: { by: Block_Hash, count: 1 }
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
    } else {
      console.log("Fetching trades since:   ", data.prices[0].trade_at);
      const sincePriceFetch = new Date(data.prices[0].trade_at);
      sincePriceFetch.setSeconds(sincePriceFetch.getSeconds() + 1);
      console.log(`Fetching trades since: ${sincePriceFetch.toISOString()}`);
      requestBody = JSON.stringify({
        query: `{
  Solana {
    DEXTrades(
      orderBy: { descending: Block_Time }
      limitBy: { by: Block_Hash, count: 1 }
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

    console.log("Sending request to Bitquery API...");
    const response = await axios.request(config);
    console.log("Received response from Bitquery API:", response.data);

    if (response.data.data == null) {
      console.error("Error in response data:", response.data.errors);
      return NextResponse.json(
        { error: response.data.errors[0].message },
        { status: 500 }
      );
    }

    const trades = response.data.data.Solana.DEXTrades;
    console.log(`Fetched ${trades.length} trades.`);
    let insertData: any[] = [];
    let lastTime = 0;
    const interval = 5000;
    console.log(trades[trades.length - 1]);
    trades.forEach((trade: any, i: number) => {
      const tradeTime = new Date(trade.Block.Time).getTime();
      if (tradeTime - lastTime >= interval) {
        insertData.push({
          token_id: data.id,
          price_sol: trade.Trade.Buy.Price,
          price_usd: trade.Trade.Buy.PriceInUSD,
          trade_at: trade.Block.Time,
          is_latest: i == 0,
        });
        lastTime = tradeTime;
      }
    });
    console.log("INSERT DATA");
    console.log(insertData);
    const batchSize = 1500;
    for (let i = 0; i < insertData.length; i += batchSize) {
      console.log("Inserting batch:", i);
      const batch = insertData.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("prices")
        .insert(batch);

      if (insertError) {
        console.error("Failed to insert price data:", insertError);
        return NextResponse.json(
          { error: "Failed to insert price data" },
          { status: 500 }
        );
      }
    }

    console.log("Price data inserted successfully.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
