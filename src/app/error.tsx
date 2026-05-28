"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative flex items-center justify-center size-16 rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertOctagon className="size-7 text-red-400" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-lg font-bold text-zinc-100">
            Algo deu errado
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          {error.digest && (
            <p className="text-[11px] text-zinc-700 mt-2 font-mono">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-2 border-zinc-700 text-zinc-400 hover:text-zinc-100"
          >
            <RefreshCw className="size-3.5" />
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/dashboard")}
            className="gap-2 border-zinc-700 text-zinc-400 hover:text-zinc-100"
          >
            <Home className="size-3.5" />
            Início
          </Button>
        </div>
      </div>
    </div>
  );
}
