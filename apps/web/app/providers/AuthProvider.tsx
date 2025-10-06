"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api, type ApiAuthClaims, type ApiAuthResponse, setAuthToken } from "../../lib/api";

export type UserRole = "buyer" | "seller" | "admin";

type AuthSession = {
  token: string;
  role: UserRole;
  email: string;
  name: string;
  companyId: string;
  userId: string;
  expiresAt: string;
  authenticatedAt: string;
};

type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  role: Exclude<UserRole, "admin">;
  remember?: boolean;
};

type AuthContextValue = {
  session: AuthSession | null;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => void;
  isHydrated: boolean;
};

type PersistedSession = {
  token: string;
  expiresAt: string;
  claims: ApiAuthClaims;
};

const SESSION_STORAGE_KEY = "tijara-link.session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapApiRole(role: string): UserRole {
  switch (role?.toUpperCase()) {
    case "SUPPLIER":
      return "seller";
    case "ADMIN":
      return "admin";
    default:
      return "buyer";
  }
}

function claimsToSession(claims: ApiAuthClaims, token: string, expiresAt: string): AuthSession {
  return {
    token,
    role: mapApiRole(claims.role),
    email: claims.email,
    name: claims.fullName || claims.email,
    companyId: claims.companyId,
    userId: claims.sub,
    expiresAt,
    authenticatedAt: new Date().toISOString(),
  };
}

function persistSession(data: PersistedSession, remember: boolean) {
  const storage = remember ? window.localStorage : window.sessionStorage;
  const fallback = remember ? window.sessionStorage : window.localStorage;

  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
  fallback.removeItem(SESSION_STORAGE_KEY);
}

function clearPersistedSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function readPersistedSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY) ??
    window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed?.token || !parsed?.expiresAt || !parsed?.claims) {
      return null;
    }

    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      clearPersistedSession();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Unable to parse stored session", error);
    clearPersistedSession();
    return null;
  }
}

function authResponseToPersisted(response: ApiAuthResponse): PersistedSession {
  const expiresAt = new Date(Date.now() + response.expiresIn * 1000).toISOString();
  return {
    token: response.accessToken,
    expiresAt,
    claims: response.claims,
  };
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = readPersistedSession();
    if (persisted) {
      setAuthToken(persisted.token);
      setSession(claimsToSession(persisted.claims, persisted.token, persisted.expiresAt));
    }
    setHydrated(true);
  }, []);

  const applyAuthResponse = useCallback(
    (response: ApiAuthResponse, remember = false): AuthSession | null => {
      if (typeof window === "undefined") return null;

      const persisted = authResponseToPersisted(response);
      const authSession = claimsToSession(persisted.claims, persisted.token, persisted.expiresAt);
      setAuthToken(persisted.token);
      persistSession(persisted, remember);
      setSession(authSession);
      return authSession;
    },
    [],
  );

  const login = useCallback(
    async ({ email, password, remember = false }: LoginPayload) => {
      try {
        const response = await api.login({ email, password });
        const authSession = applyAuthResponse(response, remember);
        if (!authSession) {
          throw new Error("Unable to sign in. Please try again.");
        }
        return authSession;
      } catch (error) {
        throw error instanceof Error ? error : new Error("Unable to sign in. Please try again.");
      }
    },
    [applyAuthResponse],
  );

  const register = useCallback(
    async ({ email, password, fullName, companyName, role, remember = false }: RegisterPayload) => {
      try {
        const response = await api.register({
          email,
          password,
          fullName,
          companyName,
          role,
        });
        const authSession = applyAuthResponse(response, remember);
        if (!authSession) {
          throw new Error("Unable to create account. Please try again.");
        }
        return authSession;
      } catch (error) {
        throw error instanceof Error ? error : new Error("Unable to create account. Please try again.");
      }
    },
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    clearPersistedSession();
    setAuthToken(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      login,
      register,
      logout,
      isHydrated,
    }),
    [isHydrated, login, logout, register, session],
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

