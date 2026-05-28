import type { Metadata } from "next";
import { PublishedView } from "@/modules/dashboard/components/published-view";

export const metadata: Metadata = {
  title: "Publicados — StudioHub",
  description: "Vídeos publicados nos canais",
};

export default function PublishedPage() {
  return <PublishedView />;
}
