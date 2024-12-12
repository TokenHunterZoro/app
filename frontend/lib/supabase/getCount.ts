import { supabase } from "../constants";

export default async function getCount() {
  const { count, error } = await supabase.from("tokens").select("*", {
    count: "exact",
    head: true, // This makes it only fetch the count, not the actual records
  });

  if (error) {
    console.error("Error fetching count:", error);
    return null;
  }

  return count;
}
