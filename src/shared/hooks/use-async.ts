"use client";

import { useCallback, useState } from "react";
import type { AsyncState } from "@/types/api";

interface UseAsyncReturn<T> {
  state: AsyncState<T>;
  execute: (fn: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

export function useAsync<T>(): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState({ status: "loading" });
    try {
      const data = await fn();
      setState({ status: "success", data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro inesperado.";
      setState({ status: "error", error: message });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, execute, reset };
}
