import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

export function LoadingSpinner({ size = "md", label, className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-red-500/70", SIZE_MAP[size])} />
      {label && <p className="text-sm text-zinc-500 animate-pulse">{label}</p>}
    </div>
  );
}

export function PageLoader({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[200px]">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
