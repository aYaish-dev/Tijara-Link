"use client";

import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";

export default function HeroCtaButtons() {
  const { session, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <>
        <Link className="button-primary" href="/login">
          Log in
        </Link>
        <Link className="button-secondary" href="/register">
          Create account
        </Link>
      </>
    );
  }

  if (session) {
    const dashboardHref =
      session.role === "seller"
        ? "/seller/dashboard"
        : session.role === "admin"
          ? "/admin"
          : "/buyer/dashboard";
    return (
      <>
        <Link className="button-primary" href={dashboardHref}>
          View Dashboard
        </Link>
        {session.role === "admin" ? (
          <Link className="button-secondary" href="/admin/orders">
            Review operations
          </Link>
        ) : (
          <a className="button-secondary" href="#create-rfq">
            Start a New RFQ
          </a>
        )}
      </>
    );
  }

  return (
    <>
      <Link className="button-primary" href="/login">
        Log in
      </Link>
      <Link className="button-secondary" href="/register">
        Create account
      </Link>
    </>
  );
}
