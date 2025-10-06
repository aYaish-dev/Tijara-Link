"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../../providers/AuthProvider";

export default function BuyerDashboardPage() {
  const router = useRouter();
  const { session, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!session) {
      router.replace("/login?role=buyer&redirect=/buyer/dashboard");
      return;
    }
    if (session.role !== "buyer") {
      router.replace("/seller/dashboard");
    }
  }, [isHydrated, router, session]);

  if (!isHydrated || !session || session.role !== "buyer") {
    return (
      <main className="page">
        <section className="card">
          <h1>Redirecting…</h1>
          <p>Checking your access and preparing your workspace.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Buyer Workspace</span>
          <h1 className="hero__title">Welcome back, {session.name ?? session.email}!</h1>
          <p className="hero__subtitle">
            Launch RFQs, review supplier responses, and keep procurement moving forward.
          </p>
          <div className="cta-row">
            <Link className="button-primary" href="/#create-rfq">
              Start a new RFQ
            </Link>
            <Link className="button-secondary" href="/orders">
              Review open orders
            </Link>
          </div>
        </div>
      </section>

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="hero__content" style={{ maxWidth: "100%", gap: "8px" }}>
            <h2 className="hero__title" style={{ fontSize: "1.75rem" }}>Quick buyer links</h2>
            <p className="hero__subtitle" style={{ fontSize: "1rem" }}>
              Jump into your most common workflows in just a click.
            </p>
          </div>
          <ul className="dashboard-list">
            <li>
              <Link href="/rfq" className="dashboard-link">
                View all RFQs
              </Link>
            </li>
            <li>
              <Link href="/orders" className="dashboard-link">
                Track purchase orders
              </Link>
            </li>
            <li>
              <Link href="/suppliers" className="dashboard-link">
                Browse verified suppliers
              </Link>
            </li>
          </ul>
        </div>

        <aside className="card card--compact">
          <h3 style={{ marginTop: 0 }}>Latest updates</h3>
          <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
            This is a mock dashboard. Connect the API to surface live RFQ status summaries.
          </p>
          <ul className="dashboard-updates">
            <li>✔️ Supplier profiles refreshed hourly.</li>
            <li>📬 Escrow workflows support digital signatures.</li>
            <li>⚡ Import RFQs directly from spreadsheets.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
