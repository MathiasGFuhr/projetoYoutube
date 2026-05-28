import type { Metadata } from "next";
import { DevelopmentView } from "@/modules/dashboard/components/development-view";

export const metadata: Metadata = {
  title: "Em Desenvolvimento — StudioHub",
  description: "Ideias sendo trabalhadas atualmente",
};

export default function DevelopmentPage() {
  return <DevelopmentView />;
}
