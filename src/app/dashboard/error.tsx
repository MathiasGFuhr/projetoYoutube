"use client";

import { useEffect } from "react";
import { ErrorState } from "@/shared/components/feedback/error-state";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <ErrorState
      title="Erro ao carregar o dashboard"
      message={error.message ?? "Ocorreu um erro inesperado."}
      onRetry={reset}
    />
  );
}
