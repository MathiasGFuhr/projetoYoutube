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

export interface TrialInfo {
  isInTrial: boolean;
  daysLeft: number;
  trialEndsAt: string | null;
}

export function useSubscription() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [trial, setTrial] = useState<TrialInfo>({ isInTrial: false, daysLeft: 0, trialEndsAt: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  const supabase = createSupabaseBrowserClient();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setTrial({ isInTrial: false, daysLeft: 0, trialEndsAt: null });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch subscription - get the most recent active/paid one first
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select(`
          id, plan_id, status, current_period_end, cancel_at_period_end,
          plan:plans (*)
        `)
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== "PGRST116") {
        console.error("[useSubscription] fetch error:", subError);
      }

      if (!subData) {
        setSubscription(null);
      } else {
        setSubscription(subData as unknown as Subscription);
      }

      // Fetch trial info from profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("trial_ends_at, created_at")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("[useSubscription] profile fetch error:", profileError);
      }

      // Calculate trial: use profile.trial_ends_at, or fallback to user.created_at + 7 days
      const trialEnds = profileData?.trial_ends_at
        ? new Date(profileData.trial_ends_at)
        : user?.created_at
          ? new Date(new Date(user.created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const now = new Date();
      const isInTrial = trialEnds > now;
      const daysLeft = isInTrial ? Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      setTrial({
        isInTrial,
        daysLeft,
        trialEndsAt: trialEnds.toISOString(),
      });
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
  const hasAccess = isActive || trial.isInTrial;

  return {
    subscription,
    currentPlan,
    plans,
    trial,
    isLoading: isLoading || authIsLoading,
    isLoadingPlans,
    isActive,
    hasAccess,
    canCreateChannel,
    canCreateVideo,
    refetch: fetchSubscription,
  };
}
