import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title = "Nenhum item encontrado",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-3 min-h-[200px] p-8 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center size-12 rounded-full bg-zinc-800/60 border border-zinc-700/40">
          <Icon className="size-5 text-zinc-500" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-zinc-300">{title}</p>
        {description && (
          <p className="text-sm text-zinc-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
