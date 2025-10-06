import Link from "next/link";
import { ReactNode } from "react";

import { SellerNavigation } from "./navigation";
import { mockSellerSession } from "./session";

const navigationItems = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/contracts", label: "Contracts" },
  { href: "/seller/reviews", label: "Reviews" },
];

export default function SellerLayout({ children }: { children: ReactNode }) {
  const session = mockSellerSession;

  if (!session || session.role !== "supplier") {
    throw new Error("Seller area requires an authenticated supplier session");
  }

  return (
    <div className="seller-layout">
      <aside className="seller-sidebar">
        <div className="seller-profile">
          <span className="seller-profile__badge">Seller workspace</span>
          <strong className="seller-profile__name">{session.companyName}</strong>
          <span className="seller-profile__meta">{session.contactName}</span>
          <span className="seller-profile__meta seller-profile__meta--muted">{session.email}</span>
        </div>

        <SellerNavigation items={navigationItems} />

        <Link className="button-secondary" href="/">
          ← Back to home
        </Link>
      </aside>

      <div className="seller-content">{children}</div>
    </div>
  );
}
