// pages/api/memecoins.ts
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "50");
  const start = (page - 1) * limit;
  const end = start + limit;

  const filePath = path.join(process.cwd(), "public", "all-memecoins.json");
  const jsonData = JSON.parse(await fs.readFile(filePath, "utf8"));
  const data = jsonData.data.Solana.Instructions;
  const paginatedData = data.slice(start, end);
  return Response.json({
    data: paginatedData,
    total: data.length,
  });
}
