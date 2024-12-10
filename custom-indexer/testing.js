const { decode } = require("@project-serum/anchor");

function decodeTokenData(data) {
  try {
    // Log raw data for analysis
    console.log("Raw data:", Buffer.from(data).toString("hex"));

    // Skip 8 bytes discriminator
    const tokenData = data.slice(8);

    // Read structure (assuming u32 lengths for strings)
    const view = new DataView(tokenData.buffer);
    const nameLen = view.getUint32(0, true);
    const name = tokenData.slice(4, 4 + nameLen).toString();

    const symbolOffset = 4 + nameLen;
    const symbolLen = view.getUint32(symbolOffset, true);
    const symbol = tokenData
      .slice(symbolOffset + 4, symbolOffset + 4 + symbolLen)
      .toString();

    console.log("Decoded lengths:", { nameLen, symbolLen });

    return { name, symbol };
  } catch (error) {
    console.error("Decode error:", error, "at offset:", error.offset);
    return { name: "unknown", symbol: "unknown" };
  }
}

decodeTokenData();
