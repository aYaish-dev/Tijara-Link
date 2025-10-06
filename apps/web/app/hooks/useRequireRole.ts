"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuth, type UserRole } from "../providers/AuthProvider";

type RequireRoleResult = {
  canRender: boolean;
  isHydrated: boolean;
  session: ReturnType<typeof useAuth>["session"];
};

function fallbackRouteForRole(role: UserRole | undefined) {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/seller/dashboard";
  return "/buyer/dashboard";
}

export function useRequireRole(requiredRole: UserRole, options: { redirectTo?: string } = {}): RequireRoleResult {
  const router = useRouter();
  const { session, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;

    if (!session) {
      const redirectTarget =
        options.redirectTo ||
        (typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : undefined);
      const redirectParam = redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : "";
      router.replace(`/login?role=${requiredRole}${redirectParam}`);
      return;
    }

    if (session.role !== requiredRole) {
      router.replace(fallbackRouteForRole(session.role));
    }
  }, [isHydrated, options.redirectTo, requiredRole, router, session]);

  return useMemo(
    () => ({
      canRender: Boolean(isHydrated && session?.role === requiredRole),
      isHydrated,
      session,
    }),
    [isHydrated, requiredRole, session],
  );
}

