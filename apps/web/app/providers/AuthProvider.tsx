"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "buyer" | "seller";

type AuthSession = {
  role: UserRole;
  email: string;
  name?: string;
  createdAt: string;
};

type LoginPayload = {
  role: UserRole;
  email: string;
  name?: string;
  remember?: boolean;
};

type AuthContextValue = {
  session: AuthSession | null;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  isHydrated: boolean;
};

const SESSION_STORAGE_KEY = "tijara-link.session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const localValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
  const sessionValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  const raw = localValue ?? sessionValue;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.role || !parsed?.email) return null;
    return parsed;
  } catch (error) {
    console.warn("Unable to parse stored session", error);
    return null;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setSession(stored);
    }
    setHydrated(true);
  }, []);

  const login = useCallback((payload: LoginPayload) => {
    if (typeof window === "undefined") return;

    const { role, email, name, remember } = payload;
    const normalizedName = name?.trim() || email.split("@")[0] || "User";
    const nextSession: AuthSession = {
      role,
      email,
      name: normalizedName,
      createdAt: new Date().toISOString(),
    };

    const preferredStorage = remember ? window.localStorage : window.sessionStorage;
    const secondaryStorage = remember ? window.sessionStorage : window.localStorage;

    preferredStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    secondaryStorage.removeItem(SESSION_STORAGE_KEY);

    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login,
      logout,
      isHydrated,
    }),
    [isHydrated, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
