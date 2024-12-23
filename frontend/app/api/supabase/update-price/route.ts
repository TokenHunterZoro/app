import { getQuery } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("Starting POST request handler");
  try {
    const { tokenId } = await request.json();
    console.log("Received request with tokenId:", tokenId);

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
    console.log("Supabase client created");

    const { data, error } = await supabase
      .from("tokens")
      .select(`id, address, prices(price_usd, price_sol, trade_at)`)
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
    const now = Date.now();
    const requestBodies = [];
    console.log("Current timestamp:", new Date(now).toISOString());

    // Always get current price
    console.log("Adding request for current price");
    requestBodies.push({
      query: getQuery(data.address, true, 0),
      variables: "{}",
    });

    const sincePriceFetch =
      data.prices.length > 0 ? new Date(data.prices[0].trade_at).getTime() : 0;
    const timeDiff = now - sincePriceFetch;
    console.log(
      "Time since last price fetch:",
      timeDiff / (60 * 1000),
      "minutes"
    );

    // Helper function to add request bodies based on time intervals
    if (!sincePriceFetch || timeDiff > 12 * 60 * 60 * 1000) {
      console.log("Adding 12h and 6h requests");
      requestBodies.push({
        query: getQuery(data.address, false, 0),
        variables: "{}",
      });
      requestBodies.push({
        query: getQuery(data.address, false, 1200),
        variables: "{}",
      });
    } else if (timeDiff > 3 * 60 * 60 * 1000) {
      console.log("Adding 3h request");
      requestBodies.push({
        query: getQuery(data.address, false, 3000),
        variables: "{}",
      });
    } else if (timeDiff > 60 * 60 * 1000) {
      console.log("Adding 1h request");
      requestBodies.push({
        query: getQuery(data.address, false, 4000),
        variables: "{}",
      });
    } else if (timeDiff > 30 * 60 * 1000) {
      console.log("Adding 30min request");
      requestBodies.push({
        query: getQuery(data.address, true, 2000),
        variables: "{}",
      });
    } else if (timeDiff > 0) {
      console.log("Adding 5min request");
      requestBodies.push({
        query: getQuery(data.address, true, 1000),
        variables: "{}",
      });
    }

    console.log(`Preparing to make ${requestBodies.length} API requests`);
    const axiosConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/eap",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.BITQUERY_API_KEY,
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
    };

    console.log("Making API requests...");
    const responses = await Promise.all(
      requestBodies.map((body) =>
        axios.request({ ...axiosConfig, data: JSON.stringify(body) })
      )
    );
    console.log(`Received ${responses.length} API responses`);

    const insertData = responses.reduce((acc: any[], response, index) => {
      console.log(`Processing response ${index + 1}/${responses.length}`);
      if (response.data.errors) {
        console.error(`Error in response ${index + 1}:`, response.data.errors);
        throw new Error(JSON.stringify(response.data.errors));
      }

      const trades = response.data.data?.Solana.DEXTrades;
      if (trades?.[0]) {
        const trade = trades[0];
        console.log(`Found trade data in response ${index + 1}:`, trade);
        acc.push({
          token_id: data.id,
          price_sol: trade.Trade.Buy.Price,
          price_usd: trade.Trade.Buy.PriceInUSD,
          trade_at: trade.Block.Time,
          is_latest: true,
        });
      } else {
        console.log(`No trade data found in response ${index + 1}`);
      }
      return acc;
    }, []);

    if (insertData.length > 0) {
      console.log("Preparing to insert price data:", insertData);
      const { error: insertError } = await supabase
        .from("prices")
        .insert(insertData);

      if (insertError) {
        console.error("Error inserting prices:", insertError);
        throw new Error(`Failed to insert prices: ${insertError.message}`);
      }

      console.log(`Successfully inserted ${insertData.length} price records`);
    } else {
      console.log("No price data to insert");
    }

    return NextResponse.json({ success: true, data: insertData });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
