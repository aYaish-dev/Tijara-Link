"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth, type UserRole } from "../providers/AuthProvider";

const ROLE_OPTIONS: Array<{ value: UserRole; title: string; description: string; emoji: string }> = [
  {
    value: "buyer",
    title: "Buyer",
    description: "Create RFQs and manage sourcing teams.",
    emoji: "🤝",
  },
  {
    value: "seller",
    title: "Seller",
    description: "Respond to leads and close new deals.",
    emoji: "🚚",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, register, isHydrated } = useAuth();

  const [role, setRole] = useState<UserRole>("buyer");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "buyer" || roleParam === "seller") {
      setRole(roleParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isHydrated) return;
    if (session) {
      const destination = session.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";
      router.replace(destination);
    }
  }, [isHydrated, router, session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Please provide your name.");
      return;
    }

    if (!company.trim()) {
      setError("Share your company or team name to continue.");
      return;
    }

    if (!email.trim()) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!password) {
      setError("Create a password to secure your account.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Double-check and try again.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const authSession = await register({
        role,
        email,
        password,
        fullName,
        companyName: company,
        remember,
      });
      const redirect = searchParams.get("redirect");
      const nextDestination = redirect ?? (authSession.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
      router.push(nextDestination);
    } catch (error) {
      console.error("Registration failed", error);
      setError(error instanceof Error ? error.message : "Unable to create account. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Create your TijaraLink account</h1>
          <p className="auth-card__subtitle">
            Choose how you&apos;ll collaborate on TijaraLink and finish onboarding in under a minute.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <span className="auth-form__label">Sign up as</span>
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
            <label className="auth-form__label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              className="auth-form__input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Amira Khan"
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="company">
              Company or team
            </label>
            <input
              id="company"
              type="text"
              className="auth-form__input"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Tijara Group"
              autoComplete="organization"
              required
            />
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              className="auth-form__input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="amira@company.com"
              autoComplete="email"
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
              placeholder="Create a secure password"
              autoComplete="new-password"
              required
            />
            <small className="auth-form__hint">
              Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.
            </small>
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="auth-form__input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-divider">
          Already using TijaraLink? <Link href="/login">Sign in here.</Link>
        </p>
      </section>
    </main>
  );
}
