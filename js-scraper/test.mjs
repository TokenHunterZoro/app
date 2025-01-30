import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv"
dotenv.config()


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
async function fetchAndFormatTokenData(keyword, apiKey) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-API-KEY': apiKey
    }
  };

  const url = `https://public-api.birdeye.so/defi/v3/search?chain=solana&keyword=${encodeURIComponent(keyword)}&target=token&sort_by=price&sort_type=desc&offset=0&limit=20`;

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.success || !data.data?.items?.[0]?.result) {
      return null;
    }

    const tokens = data.data.items[0].result.map(token => ({
      name: token.name,
      symbol: token.symbol,
      address: token.address,
      price: token.price,
      marketCap: token.market_cap,
      volume24h: token.volume_24h_usd,
      liquidity: token.liquidity,
      lastTraded: token.last_trade_human_time,
      verification: token.verified ? 'Verified' : 'Unverified',
      metrics: {
        priceChange24h: `${token.price_change_24h_percent}%`,
        volumeChange24h: `${token.volume_24h_change_percent || 0}%`,
        trades24h: token.trade_24h || 0,
        uniqueWallets24h: token.unique_wallet_24h || 0
      }
    }));

    // Sort by liquidity and volume
    return tokens.sort((a, b) => (b.liquidity + b.volume24h) - (a.liquidity + a.volume24h));
  } catch (error) {
    console.error('Error fetching token data:', error);
    return null;
  }
}

// Example usage:
const formatTokensForAI = (tokens) => {
  if (!tokens?.length) return "No token data available";

  return tokens.map(token =>
    `Token: ${token.name} (${token.symbol})
    Address: ${token.address}
    Price: $${token.price.toFixed(6)}
    Market Cap: $${token.marketCap.toLocaleString()}
    24h Volume: $${token.volume24h.toLocaleString()}
    Liquidity: $${token.liquidity.toLocaleString()}
    Status: ${token.verification}
    Key Metrics:
    - 24h Price Change: ${token.metrics.priceChange24h}
    - 24h Volume Change: ${token.metrics.volumeChange24h}
    - 24h Trades: ${token.metrics.trades24h}
    - 24h Unique Wallets: ${token.metrics.uniqueWallets24h}`
  ).join('\n\n');
};

const getTrendingMentions = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_trending_mentions');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting trending mentions:', error);
    throw error;
  }
};

// Usage
// fetchAndFormatTokenData('BOTIFY', process.env.BIRDEYE_API_KEY || '')
//   .then(tokens => {
//     const formattedData = formatTokensForAI(tokens);
//     console.log(formattedData);
//     // Now formattedData can be used as input for AI prompt
//   })
//   .catch(console.error);


async function main() {
  // Fetch from supabase.
  console.log(await getTrendingMentions())
  // Search and get address

  // Get Token info 

  // Format

}

main()
