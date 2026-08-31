import { createClient } from "@/lib/supabase/server";

export async function checkRateLimit(
  request: Request,
  action: string,
  maxAttempts = 20,
  windowMinutes = 15
): Promise<{ allowed: boolean }> {
  const supabase = await createClient();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const identifier = `${ip}:${action}`;

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_action: action,
    p_max_attempts: maxAttempts,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true };
  }

  return { allowed: data as boolean };
}
