"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "../../providers/AuthProvider";

export default function SellerDashboardPage() {
  const router = useRouter();
  const { session, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) return;
    if (!session) {
      router.replace("/login?role=seller&redirect=/seller/dashboard");
      return;
    }
    if (session.role !== "seller") {
      const destination = session.role === "buyer" ? "/buyer/dashboard" : "/admin";
      router.replace(destination);
    }
  }, [isHydrated, router, session]);

  if (!isHydrated || !session || session.role !== "seller") {
    return (
      <main className="page">
        <section className="card">
          <h1>Redirecting…</h1>
          <p>Checking your access and preparing supplier insights.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Seller Workspace</span>
          <h1 className="hero__title">Great to see you, {session.name ?? session.email}!</h1>
          <p className="hero__subtitle">
            Respond to RFQs, manage contracts, and stay ahead of buyer expectations.
          </p>
          <div className="cta-row">
            <Link className="button-primary" href="/rfq">
              Discover active RFQs
            </Link>
            <Link className="button-secondary" href="/suppliers">
              Update your profile
            </Link>
          </div>
        </div>
      </section>

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="hero__content" style={{ maxWidth: "100%", gap: "8px" }}>
            <h2 className="hero__title" style={{ fontSize: "1.75rem" }}>Quick seller actions</h2>
            <p className="hero__subtitle" style={{ fontSize: "1rem" }}>
              Stay responsive and highlight what sets your team apart.
            </p>
          </div>
          <ul className="dashboard-list">
            <li>
              <Link href="/rfq" className="dashboard-link">
                Browse open opportunities
              </Link>
            </li>
            <li>
              <Link href="/orders" className="dashboard-link">
                Manage escrow-backed orders
              </Link>
            </li>
            <li>
              <Link href="/suppliers" className="dashboard-link">
                Share testimonials and reviews
              </Link>
            </li>
          </ul>
        </div>

        <aside className="card card--compact">
          <h3 style={{ marginTop: 0 }}>Marketplace tips</h3>
          <p style={{ color: "var(--muted)", marginBottom: "12px" }}>
            Boost your win rate with actionable insights from successful suppliers.
          </p>
          <ul className="dashboard-updates">
            <li>💬 Reply to RFQs within 24 hours to stay top-of-mind.</li>
            <li>📈 Keep catalogs updated to showcase inventory strength.</li>
            <li>🤝 Highlight certifications to build trust quickly.</li>
          </ul>
        </aside>
      </section>
    </main>
  );
}
