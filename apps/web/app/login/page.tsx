"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth, type UserRole } from "../providers/AuthProvider";

const ROLE_OPTIONS: Array<{ value: UserRole; title: string; description: string; emoji: string }> = [
  {
    value: "buyer",
    title: "Buyer",
    description: "Procurement teams managing sourcing and RFQs.",
    emoji: "🛒",
  },
  {
    value: "seller",
    title: "Seller",
    description: "Suppliers responding to new opportunities.",
    emoji: "🏭",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, login, isHydrated } = useAuth();

  const [role, setRole] = useState<UserRole>("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "buyer" || roleParam === "seller") {
      setRole(roleParam);
    }
  }, [searchParams]);

  const destination = useMemo(() => {
    const redirect = searchParams.get("redirect");
    if (redirect) return redirect;
    return role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";
  }, [role, searchParams]);

  useEffect(() => {
    if (!isHydrated) return;
    if (session) {
      const dashboard = session.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";
      router.replace(dashboard);
    }
  }, [isHydrated, router, session]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    setSubmitting(true);
    login({ role, email, remember });
    router.push(destination);
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">Select your role and sign in to continue collaborating.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <span className="auth-form__label">Choose your role</span>
            <div className="auth-role-selector">
              {ROLE_OPTIONS.map((option) => {
                const isActive = role === option.value;
                return (
                  <label
                    key={option.value}
                    className={`auth-role-option${isActive ? " auth-role-option--active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={isActive}
                      onChange={() => setRole(option.value)}
                    />
                    <span>
                      {option.emoji} {option.title}
                    </span>
                    <small>{option.description}</small>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="auth-form__input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="auth-form__input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <label className="auth-form__remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Keep me signed in on this device
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="button-primary" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-divider">
          Need an account? <Link href="/register">Create one in moments.</Link>
        </p>
      </section>
    </main>
  );
}
