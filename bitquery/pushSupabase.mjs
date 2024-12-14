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
const sanitize = (str) => (str ? str.replace(/\u0000/g, "") : str);
async function importTokens(filePath) {
  try {
    // Read JSON file
    const jsonData = await fs.readFile(filePath, "utf8");
    const tokens = JSON.parse(jsonData);

    let totalCount = 0;
    const pushData = [];
    for (const tokenData of tokens.data.Solana.Instructions) {
      // const { error } = await supabase.from("tokens").insert([
      //   {
      //     name: tokenData.Instruction.Program.Arguments[0].Value.string,
      //     symbol: tokenData.Instruction.Program.Arguments[1].Value.string,
      //     uri: tokenData.Instruction.Program.Arguments[2].Value.string,
      //     created_at: tokenData.Block.Time,
      //     address: tokenData.Instruction.Program.Address,
      //     create_tx: tokenData.Transaction.Signature,
      //   },
      // ]);

      try {
        const temp_push_data = {
          name: tokenData.Instruction.Program.Arguments[0].Value.string,
          symbol: tokenData.Instruction.Program.Arguments[1].Value.string,
          uri: tokenData.Instruction.Program.Arguments[2].Value.string,
          created_at: tokenData.Block.Time,
          address: tokenData.Instruction.Program.Address,
          create_tx: tokenData.Transaction.Signature,
        };
        if (
          temp_push_data.name == undefined ||
          temp_push_data.symbol == undefined ||
          temp_push_data.uri == undefined ||
          temp_push_data.created_at == undefined ||
          temp_push_data.address == undefined ||
          temp_push_data.create_tx == undefined
        ) {
          throw new Error("Data is not correct");
        }
        pushData.push({
          name: sanitize(
            tokenData.Instruction.Program.Arguments[0].Value.string
          ),
          symbol: sanitize(
            tokenData.Instruction.Program.Arguments[1].Value.string
          ),
          uri: sanitize(
            tokenData.Instruction.Program.Arguments[2].Value.string
          ),
          created_at: sanitize(tokenData.Block.Time),
          address: sanitize(tokenData.Instruction.Program.Address),
          create_tx: sanitize(tokenData.Transaction.Signature),
        });
        totalCount++;
        console.log(totalCount);

        if (
          totalCount % 3000 == 0 ||
          totalCount == tokens.data.Solana.Instructions.length
        ) {
          console.log(
            "Pushing from range ",
            totalCount < 3000
              ? 0
              : totalCount % 3000 == 0
              ? totalCount - 3000
              : totalCount - (totalCount % 3000),
            " to ",
            totalCount
          );
          const { error } = await supabase.from("tokens").insert(pushData);
          if (error) {
            console.error(`Failed to import tokens`, error);
          }
          pushData.length = 0;
        }
      } catch (e) {
        console.log("SKIPPING DATA");
        console.log("Error", e);
      }
    }

    // try {
    //   const { error } = await supabase.from("tokens").insert(pushData);
    //   if (error) {
    //     console.error(`Failed to import tokens`, error);
    //   }
    // } catch (e) {
    //   console.error("Error processing tokens:", e);
    // }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("File not found:", filePath);
    } else {
      console.error("Error reading or parsing file:", error);
    }
  }
}

importTokens("./results/next-memecoins-7.json")
  .catch(console.error)
  .finally(() => {
    console.log("Import process completed");
  });
