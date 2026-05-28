"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex items-center justify-center bg-[#050505] text-zinc-100 p-6">
        <div className="text-center space-y-4">
          <p className="text-4xl font-bold text-red-500">500</p>
          <p className="text-sm text-zinc-400">Erro crítico. Tente recarregar a página.</p>
          {error.digest && (
            <p className="text-xs text-zinc-600 font-mono">ID: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
