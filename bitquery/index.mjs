async function main() {
  await getAllMemecoins();
  await fetchAndPushPrices();
}

main();
