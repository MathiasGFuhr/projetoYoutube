import type { Metadata } from "next";
import { IdeasView } from "@/modules/dashboard/components/ideas-view";

export const metadata: Metadata = {
  title: "Ideias — StudioHub",
  description: "Banco de ideias de clipes",
};

export default function IdeasPage() {
  return <IdeasView />;
}
