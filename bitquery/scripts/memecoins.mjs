import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs/promises";
import { pushMemecoins } from "./supabase/memecoins.mjs";
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

const getMetadata = async () => {
  try {
    return JSON.parse(await fs.readFile(path, "utf-8"));
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
  const metadata = await getMetadata();
  const latestFetchTimestamp = new Date(metadata.latestFetchTimestamp);
  latestFetchTimestamp.setSeconds(latestFetchTimestamp.getSeconds() + 1);

  const data = JSON.stringify({
    query: `{
    Solana {
      Instructions(
        where: {Instruction: {Program: {Method: {is: "create"}, Name: {is: "pump"}}}, Block: {Time: {since: "${latestFetchTimestamp.toISOString()}"}}}
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
  try {
    const response = await axios.request(config);
    await fs.writeFile(
      "results/memecoins/next-memecoins-" + Date.now() + ".json",
      JSON.stringify(response.data, null, 2),
      "utf-8"
    );
    metadata.sinceTimestamp = latestFetchTimestamp.toISOString();
    metadata.latestFetchTimestamp =
      response.data.data.Solana.Instructions[0].Block.Time;
    console.log("NEW MEMECOINS METADATA");
    console.log(metadata);
    await updateMetadata(metadata);
    console.log("PUSHING TO SUPABASE");
    console.log(response.data.data.Solana.Instructions.length);
    await pushMemecoins("", response.data);
  } catch (e) {
    console.error("Error fetching data:", e);
    throw e;
  }
}

// fetchAndPushMemecoins();
