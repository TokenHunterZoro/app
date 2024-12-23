import { fetchAndPushMemecoins } from "./scripts/memecoins.mjs";
import { fetchAndPushPrices } from "./scripts/prices.mjs";

async function main() {
  try {
    await fetchAndPushMemecoins();
    await fetchAndPushPrices();
  } catch (e) {
    console.error("Error fetching data:", e);
  }
}

main();
