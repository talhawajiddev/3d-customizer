import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DESIGNS_TABLE, type DesignRecord } from "@/lib/supabase/client";

export async function getDesignsByUser(
  userId: string
): Promise<DesignRecord[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    throw new Error("Unable to initialize Supabase.");
  }

  const { data, error } = await supabase
    .from(DESIGNS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data as DesignRecord[] | null) ?? [];
}
