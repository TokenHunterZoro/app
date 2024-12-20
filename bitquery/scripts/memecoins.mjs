import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs/promises";
import { importTokens } from "./supabase/memecoins.mjs";
dotenv.config();

// axios
//   .request(config)
//   .then((response) => {
//     // Save the response data as a JSON file
//     fs.writeFileSync(
//       "results/next-memecoins-" + Date.now() + ".json",
//       JSON.stringify(response.data, null, 2),
//       "utf-8"
//     );
//     console.log("Data saved to response.json");
//     importTokens("", response.data);
//   })
//   .catch((error) => {
//     console.error("Error fetching data:", error);
//   });
const path = "results/memecoins/metadata.json";

const getMetadata = () => {
  try {
    if (fs.existsSync(path)) {
      return JSON.parse(fs.readFileSync(path, "utf-8"));
    }
  } catch (error) {
    console.error("Error reading metadata:", error);
  }
  // Return default metadata if file doesn't exist or is invalid
  return {
    sinceTimestamp: "2024-12-20T03:46:24Z",
    latestFetchTimestamp: null,
  };
};

async function updateMetadata(metadata) {
  await fs.writeFile(path, JSON.stringify(metadata, null, 2), "utf-8");
}

export async function fetchAndPushMemecoins() {
  const metadata = getMetadata();

  const data = JSON.stringify({
    query: `{
  Solana {
    Instructions(
      where: {Instruction: {Program: {Method: {is: "create"}, Name: {is: "pump"}}}, Block: {Time: {since: "${
        metadata.latestFetchTimestamp + 1
      }"}}}
      orderBy: {descending: Block_Time}
    ) {
      Instruction {
        Program {
          Address
          Arguments {
            Value {
              ... on Solana_ABI_Json_Value_Arg {
                json
              }
              ... on Solana_ABI_Float_Value_Arg {
                float
              }
              ... on Solana_ABI_Boolean_Value_Arg {
                bool
              }
              ... on Solana_ABI_Bytes_Value_Arg {
                hex
              }
              ... on Solana_ABI_BigInt_Value_Arg {
                bigInteger
              }
              ... on Solana_ABI_Address_Value_Arg {
                address
              }
              ... on Solana_ABI_String_Value_Arg {
                string
              }
              ... on Solana_ABI_Integer_Value_Arg {
                integer
              }
            }
          }
        }
      }
      Transaction {
        Signature
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
  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://streaming.bitquery.io/eap",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BITQUERY_API_KEY,
      Authorization: "Bearer " + process.env.ACCESS_TOKEN,
    },
    data: data,
  };
  const response = await axios.request(config);
  await fs.writeFile(
    "results/next-memecoins-" + Date.now() + ".json",
    JSON.stringify(response.data, null, 2),
    "utf-8"
  );
  metadata.sinceTimestamp = metadata.latestFetchTimestamp + 1;
  metadata.latestFetchTimestamp =
    response.data.data.Solana.Instructions[0].Block.Time;

  await updateMetadata(metadata);
  await pushMemecoins("", response.data);
}
