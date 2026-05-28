"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/core/lib/supabase/browser";
import { getEnv } from "@/core/config/env";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { AuthUser, AuthSession } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  readonly children: React.ReactNode;
  readonly initialUser?: AuthUser | null;
  readonly initialSession?: AuthSession | null;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!getEnv()) return;
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!getEnv()) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    localStorage.removeItem("studiohub-remember-me");
    setUser(null);
    setSession(null);
  }, []);

  useEffect(() => {
    if (!getEnv()) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    // Get existing session on mount
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Note: removed beforeunload signOut to prevent page unload blocking
  // The Supabase session is managed by the client library automatically

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, isLoading, signOut, refreshSession }),
    [user, session, isLoading, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
