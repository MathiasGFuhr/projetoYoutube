"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Ocorreu um erro inesperado. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 min-h-[200px] p-8 text-center">
      <div className="flex items-center justify-center size-12 rounded-full bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="size-5 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
        <p className="text-sm text-zinc-500 mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 border-zinc-700 text-zinc-400 hover:text-zinc-100"
        >
          <RefreshCw className="size-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
