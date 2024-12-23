import { getQuery } from "@/lib/utils";
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
        )
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
    let firstRequestBody = "";
    let secondRequestBody = "";
    let thirdRequestBody = "";
    const now = Date.now();

    if (data.prices.length == 0) {
      console.log("No prices found, preparing to fetch trades.");
      firstRequestBody = JSON.stringify({
        query: getQuery(data.address, "", ""),
        variables: "{}",
      });
      secondRequestBody = JSON.stringify({
        query: getQuery(
          data.address,
          new Date(now - 24 * 60 * 60 * 1000 - 1000).toISOString(),
          new Date(now - 24 * 60 * 60 * 1000 + 1000).toISOString()
        ),
        variables: "{}",
      });
      thirdRequestBody = JSON.stringify({
        query: getQuery(
          data.address,
          new Date(now - 12 * 60 * 60 * 1000 - 1000).toISOString(),
          new Date(now - 12 * 60 * 60 * 1000 + 1000).toISOString()
        ),
        variables: "{}",
      });
    } else {
      console.log("Fetching trades since:   ", data.prices[0].trade_at);
      const sincePriceFetch = new Date(data.prices[0].trade_at);
      firstRequestBody = JSON.stringify({
        query: getQuery(data.address, "", ""),
        variables: "{}",
      });
      if (now - sincePriceFetch.getTime() > 24 * 60 * 60 * 1000) {
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 24 * 60 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 24 * 60 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
        thirdRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 12 * 60 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 12 * 60 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
      } else if (now - sincePriceFetch.getTime() > 12 * 60 * 60 * 1000) {
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 12 * 60 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 12 * 60 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
        thirdRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 6 * 60 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 6 * 60 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
      } else if (now - sincePriceFetch.getTime() > 3 * 60 * 60 * 1000)
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 3 * 60 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 3 * 60 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
      else if (now - sincePriceFetch.getTime() > 1 * 60 * 60 * 1000)
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 1 * 60 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 1 * 60 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
      else if (now - sincePriceFetch.getTime() > 30 * 60 * 1000)
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 30 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 30 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
      else if (now - sincePriceFetch.getTime() > 15 * 60 * 1000)
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 15 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 15 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
      else
        secondRequestBody = JSON.stringify({
          query: getQuery(
            data.address,
            new Date(now - 5 * 60 * 1000 - 1000).toISOString(),
            new Date(now - 5 * 60 * 1000 + 1000).toISOString()
          ),
          variables: "{}",
        });
    }

    const firstRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/eap",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.BITQUERY_API_KEY,
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
      data: firstRequestBody,
    };
    const secondRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://streaming.bitquery.io/eap",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.BITQUERY_API_KEY,
        Authorization: "Bearer " + process.env.ACCESS_TOKEN,
      },
      data: secondRequestBody,
    };

    const insertData: any[] = [];

    const firstResponse = await axios.request(firstRequestConfig);
    const secondResponse = await axios.request(secondRequestConfig);

    if (
      firstResponse.data.data &&
      firstResponse.data.data.Solana.DEXTrades[0]
    ) {
      const firstTrade = firstResponse.data.data.Solana.DEXTrades[0];
      insertData.push({
        token_id: data.id,
        price_sol: firstTrade.Trade.Buy.Price,
        price_usd: firstTrade.Trade.Buy.PriceInUSD,
        trade_at: firstTrade.Block.Time,
        is_latest: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: firstResponse.data.errors
          ? firstResponse.data.errors
          : "No trades found",
      });
    }

    if (
      secondResponse.data.data &&
      secondResponse.data.data.Solana.DEXTrades[0]
    ) {
      const secondTrade = secondResponse.data.data.Solana.DEXTrades[0];
      insertData.push({
        token_id: data.id,
        price_sol: secondTrade.Trade.Buy.Price,
        price_usd: secondTrade.Trade.Buy.PriceInUSD,
        trade_at: secondTrade.Block.Time,
        is_latest: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: secondResponse.data.errors
          ? secondResponse.data.errors
          : "No trades found",
      });
    }

    if (thirdRequestBody) {
      const thirdRequestConfig = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://streaming.bitquery.io/eap",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.BITQUERY_API_KEY,
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
        data: thirdRequestBody,
      };
      const thirdResponse = await axios.request(thirdRequestConfig);
      if (
        thirdResponse.data.data &&
        thirdResponse.data.data.Solana.DEXTrades.length > 0
      ) {
        const thirdTrade = thirdResponse.data.data.Solana.DEXTrades[0];
        insertData.push({
          token_id: data.id,
          price_sol: thirdTrade.Trade.Buy.Price,
          price_usd: thirdTrade.Trade.Buy.PriceInUSD,
          trade_at: thirdTrade.Block.Time,
          is_latest: true,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: thirdResponse.data.errors
            ? thirdResponse.data.errors
            : "No trades found",
        });
      }
    }

    const { error: insertError } = await supabase
      .from("prices")
      .insert(insertData);

    console.log("Inserted data:", insertError);

    return NextResponse.json({ success: true, data: insertData });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
