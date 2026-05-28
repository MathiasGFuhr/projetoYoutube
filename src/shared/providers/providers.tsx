"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { DataCacheProvider } from "@/shared/providers/data-cache-provider";

interface ProvidersProps {
  readonly children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <DataCacheProvider>
        {children}
        <Toaster position="top-right" richColors />
      </DataCacheProvider>
    </AuthProvider>
  );
}
