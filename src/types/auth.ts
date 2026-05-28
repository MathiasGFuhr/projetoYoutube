import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser extends User {}

export interface AuthSession extends Session {}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
