import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { DashboardView } from "@/modules/dashboard/components/dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — StudioHub",
  description: "Painel de controle do StudioHub",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Usuário";

  return <DashboardView displayName={displayName} />;
}
