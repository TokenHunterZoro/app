import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const data = JSON.stringify({
  query: `{
  Solana {
    Instructions(
      where: {Instruction: {Program: {Method: {is: "create"}, Name: {is: "pump"}}}, Block: {Time: {since: "2024-12-11T11:18:34Z"}}}
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

axios
  .request(config)
  .then((response) => {
    // Save the response data as a JSON file
    fs.writeFileSync(
      "results/next-memecoins-2.json",
      JSON.stringify(response.data, null, 2),
      "utf-8"
    );
    console.log("Data saved to response.json");
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
