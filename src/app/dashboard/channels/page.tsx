import type { Metadata } from "next";
import { ChannelsView } from "@/modules/dashboard/components/channels-view";

export const metadata: Metadata = {
  title: "Canais — StudioHub",
  description: "Gerenciamento de canais do YouTube",
};

export default function ChannelsPage() {
  return <ChannelsView />;
}
