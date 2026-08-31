import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

type RequireAdminSuccess = { authorized: true; supabase: SupabaseClient; user: User };
type RequireAdminError = { authorized: false; error: string; status: 401 | 403 };

export async function requireAdmin(): Promise<RequireAdminSuccess | RequireAdminError> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { authorized: false, error: "No autenticado", status: 401 as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { authorized: false, error: "No eres admin", status: 403 as const };
  }

  return { authorized: true, supabase, user };
}
