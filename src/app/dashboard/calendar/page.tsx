import type { Metadata } from "next";
import { CalendarView } from "@/modules/dashboard/components/calendar-view";

export const metadata: Metadata = {
  title: "Calendário — StudioHub",
  description: "Calendário editorial de vídeos",
};

export default function CalendarPage() {
  return <CalendarView />;
}
