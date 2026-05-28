import { getSupabaseBrowserClient } from "@/core/lib/supabase/browser";
import type { AuthUser, AuthSession } from "@/types/auth";

export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async getSession(): Promise<AuthSession | null> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  async getUser(): Promise<AuthUser | null> {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
};
