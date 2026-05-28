import type { Metadata } from "next";
import { SettingsView } from "@/modules/dashboard/components/settings-view";

export const metadata: Metadata = {
  title: "Configurações — StudioHub",
  description: "Configurações do usuário",
};

export default function SettingsPage() {
  return <SettingsView />;
}
