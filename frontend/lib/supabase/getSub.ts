import { supabase } from "../constants";

export default async function getSub(address: string) {
  const { data, error } = await supabase
    .from("subs")
    .select("expires")
    .eq("address", address)
    .single();

  if (error) {
    console.error("Error fetching data:", error);
    return null;
  }

  return data.expires;
}
