import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { cookies } from "next/headers";
import { requireEnv } from "@/core/config/env";

export async function createSupabaseServerClient() {
  console.log("[createSupabaseServerClient] Starting...");
  const env = requireEnv();
  console.log("[createSupabaseServerClient] Env loaded:", { url: env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20) + "...", keyExists: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY });
  const cookieStore = await cookies();
  console.log("[createSupabaseServerClient] Cookies loaded, count:", cookieStore.getAll().length);

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — session refresh handled by middleware
        }
      },
    },
  });
}
