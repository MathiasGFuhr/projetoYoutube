import type { Metadata } from "next";
import { SupportView } from "@/modules/dashboard/components/support-view";

export const metadata: Metadata = {
  title: "Suporte e Contato — StudioHub",
  description: "Entre em contato com o suporte do StudioHub",
};

export default function SupportPage() {
  return <SupportView />;
}
