"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/shared/providers/auth-provider";
import { DataCacheProvider } from "@/shared/providers/data-cache-provider";
import type { AuthUser, AuthSession } from "@/types/auth";

interface ProvidersProps {
  readonly children: React.ReactNode;
  readonly initialUser?: AuthUser | null;
  readonly initialSession?: AuthSession | null;
}

export function Providers({ children, initialUser = null, initialSession = null }: ProvidersProps) {
  return (
    <AuthProvider initialUser={initialUser} initialSession={initialSession}>
      <DataCacheProvider>
        {children}
        <Toaster position="top-right" richColors />
      </DataCacheProvider>
    </AuthProvider>
  );
}
