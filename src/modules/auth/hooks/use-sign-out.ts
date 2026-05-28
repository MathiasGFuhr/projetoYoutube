"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOutAction } from "@/modules/auth/actions/sign-out.action";

interface UseSignOutReturn {
  signOut: () => void;
  isPending: boolean;
}

export function useSignOut(): UseSignOutReturn {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signOut = () => {
    startTransition(async () => {
      const result = await signOutAction();
      if (!result.success && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Sessão encerrada com sucesso.");
      router.push("/auth");
      router.refresh();
    });
  };

  return { signOut, isPending };
}
