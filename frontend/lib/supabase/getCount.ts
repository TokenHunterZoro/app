import { createClient } from "@supabase/supabase-js";

export default async function getCount() {
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_SECRET || ""
  );
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
