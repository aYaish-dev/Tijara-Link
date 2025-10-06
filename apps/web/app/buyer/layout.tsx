import Link from "next/link";
import type { ReactNode } from "react";

type MockBuyerSession = {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
};

function getMockBuyerSession(): MockBuyerSession | null {
  if (process.env.NEXT_PUBLIC_DISABLE_BUYER === "true") {
    return null;
  }

  const userName = process.env.NEXT_PUBLIC_BUYER_NAME || "Layla Haddad";
  const email = process.env.NEXT_PUBLIC_BUYER_EMAIL || "layla@alqudsimports.ps";
  const companyName = process.env.NEXT_PUBLIC_BUYER_COMPANY || "Al Quds Imports";

  return {
    userId: process.env.NEXT_PUBLIC_BUYER_ID || "buyer-001",
    companyId: process.env.NEXT_PUBLIC_BUYER_COMPANY_ID || "company-001",
    userName,
    email,
    companyName,
  };
}

type Props = {
  children: ReactNode;
};

export default function BuyerLayout({ children }: Props) {
  const session = getMockBuyerSession();

  if (!session) {
    return (
      <main className="page">
        <section className="card empty-state" style={{ gap: "12px" }}>
          <h1 style={{ margin: 0 }}>Buyer workspace unavailable</h1>
          <p style={{ margin: 0 }}>
            We couldn't establish the mock buyer session. Set NEXT_PUBLIC_DISABLE_BUYER to false or provide the buyer details to
            explore this flow.
          </p>
          <Link className="button-secondary" href="/">
            ← Back to platform overview
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="buyer-shell">
      <header className="buyer-shell__topbar">
        <div className="buyer-shell__brand">
          <Link href="/buyer/dashboard" className="buyer-shell__logo">
            TijaraLink Buyer Workspace
          </Link>
          <span className="buyer-shell__company">{session.companyName}</span>
        </div>
        <nav className="buyer-shell__nav">
          <Link href="/buyer/dashboard" className="buyer-shell__nav-link">
            Dashboard
          </Link>
        </nav>
        <div className="buyer-shell__user">
          <span className="buyer-shell__user-name">{session.userName}</span>
          <span className="buyer-shell__user-email">{session.email}</span>
        </div>
      </header>
      <main className="page buyer-shell__content">{children}</main>
    </div>
  );
}
