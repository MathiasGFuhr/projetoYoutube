"use client";

import { useEffect } from "react";
import { useAuth } from "@/shared/hooks/use-auth";

export function AutoRefreshOnFirstVisit() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Only run when auth is done loading
    if (isLoading) return;

    // If user is logged in and we haven't done the initial refresh yet
    if (user && !sessionStorage.getItem("dashboard-refreshed")) {
      sessionStorage.setItem("dashboard-refreshed", "true");
      window.location.reload();
    }

    // Clear the flag when user logs out
    if (!user) {
      sessionStorage.removeItem("dashboard-refreshed");
    }
  }, [user, isLoading]);

  return null;
}
