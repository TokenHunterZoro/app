import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_SECRET;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_KEY in environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importTokens(filePath) {
  try {
    // Read JSON file
    const jsonData = await fs.readFile(filePath, "utf8");
    const tokens = JSON.parse(jsonData);

    let totalCount = 0;
    // const pushData = [];
    for (const tokenData of tokens.data.Solana.Instructions) {
      console.log({
        name: tokenData.Instruction.Program.Arguments[0].Value.string,
        symbol: tokenData.Instruction.Program.Arguments[1].Value.string,
        uri: tokenData.Instruction.Program.Arguments[2].Value.string,
        created_at: tokenData.Block.Time,
        address: tokenData.Instruction.Program.Address,
        create_tx: tokenData.Transaction.Signature,
      });
      const { error } = await supabase.from("tokens").insert([
        {
          name: tokenData.Instruction.Program.Arguments[0].Value.string,
          symbol: tokenData.Instruction.Program.Arguments[1].Value.string,
          uri: tokenData.Instruction.Program.Arguments[2].Value.string,
          created_at: tokenData.Block.Time,
          address: tokenData.Instruction.Program.Address,
          create_tx: tokenData.Transaction.Signature,
        },
      ]);

      // pushData.push({
      //   name: tokenData.Instruction.Program.Arguments[0].Value.string,
      //   symbol: tokenData.Instruction.Program.Arguments[1].Value.string,
      //   uri: tokenData.Instruction.Program.Arguments[2].Value.string,
      //   created_at: tokenData.Block.Time,
      //   address: tokenData.Instruction.Program.Address,
      //   create_tx: tokenData.Transaction.Signature,
      // });
      totalCount++;
    }

    try {
      // const { error } = await supabase.from("tokens").insert(pushData);

      if (error) {
        console.error(`Failed to import tokens`, error);
      } else {
        console.log(`Successfully imported tokens`);
      }
    } catch (error) {
      console.error("Error processing tokens:", error);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("File not found:", filePath);
    } else {
      console.error("Error reading or parsing file:", error);
    }
  }
}

importTokens("./results/all-memecoins.json")
  .catch(console.error)
  .finally(() => {
    console.log("Import process completed");
  });
