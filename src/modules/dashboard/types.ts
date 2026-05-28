export interface StatCard {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ElementType;
}

export interface ActivityItem {
  title: string;
  description: string;
  time: string;
  type: "project" | "member" | "deploy" | "system";
}

export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
}
