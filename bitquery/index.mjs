import { fetchAndPushMemecoins } from "./scripts/memecoins.mjs";
import { fetchAndPushPrices } from "./scripts/prices.mjs";

async function main() {
  await fetchAndPushMemecoins();
  await fetchAndPushPrices();
}

main();
