import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/core/lib/supabase/server";
import { DashboardSidebar } from "@/modules/dashboard/components/sidebar";
import { MobileSidebarShell } from "@/modules/dashboard/components/mobile-sidebar-shell";

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-zinc-100">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <MobileSidebarShell />
      <main className="relative flex-1 overflow-y-auto">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_0%,rgba(255,31,31,0.10),transparent_28rem),radial-gradient(circle_at_18%_30%,rgba(245,158,11,0.055),transparent_24rem)]" />
        <div className="relative min-h-full pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
