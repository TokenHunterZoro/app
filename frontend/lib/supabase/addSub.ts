import { supabase } from "../constants";

export default async function addSub(
  address: string,
  amount: number,
  expires: number
) {
  const { data, error } = await supabase.from("subs").insert([
    {
      created_at: new Date().toISOString(),
      address: address,
      amount: amount,
      expires: new Date().getTime() + expires * 10000,
    },
  ]);

  if (error) {
    console.error("Error fetching data:", error);
    return [];
  }

  return data;
}
