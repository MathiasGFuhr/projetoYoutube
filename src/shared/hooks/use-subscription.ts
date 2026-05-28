"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/core/lib/supabase/browser";
import { useAuth } from "@/shared/hooks/use-auth";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  interval: string;
  channel_limit: number;
  video_limit: number;
  team_limit: number;
  analytics_level: string;
  stripe_price_id: string | null;
  features: import("@/lib/supabase/database.types").Json;
}

export interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plan: Plan | null;
}

const CACHE_TTL = 60000; // 1 minute

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const supabase = createSupabaseBrowserClient();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          id, plan_id, status, current_period_end, cancel_at_period_end,
          plan:plans (*)
        `)
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[useSubscription] fetch error:", error);
      }

      if (!data) {
        setSubscription(null);
      } else {
        setSubscription(data as unknown as Subscription);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  const fetchPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: true });

      if (error) {
        console.error("[useSubscription] plans fetch error:", error);
      } else {
        setPlans(data ?? []);
      }
    } finally {
      setIsLoadingPlans(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, [fetchSubscription, fetchPlans]);

  const currentPlan = subscription?.plan ?? plans.find((p) => p.slug === "free") ?? null;

  const canCreateChannel = useCallback(
    (currentCount: number) => {
      if (!currentPlan) return false;
      return currentCount < currentPlan.channel_limit;
    },
    [currentPlan]
  );

  const canCreateVideo = useCallback(
    (currentCount: number) => {
      if (!currentPlan) return false;
      return currentCount < currentPlan.video_limit;
    },
    [currentPlan]
  );

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  return {
    subscription,
    currentPlan,
    plans,
    isLoading,
    isLoadingPlans,
    isActive,
    canCreateChannel,
    canCreateVideo,
    refetch: fetchSubscription,
  };
}
