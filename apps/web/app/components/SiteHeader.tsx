"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

function navLinkClassName(isActive: boolean) {
  return isActive ? "site-header__link site-header__link--active" : "site-header__link";
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, isHydrated } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const dashboardHref = session?.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand">
          TijaraLink
        </Link>
        <nav className="site-header__nav" aria-label="Primary">
          <Link href="/" className={navLinkClassName(pathname === "/")}>Home</Link>
          <Link href="/rfq" className={navLinkClassName(pathname?.startsWith("/rfq") ?? false)}>
            RFQs
          </Link>
          <Link
            href="/suppliers"
            className={navLinkClassName(pathname?.startsWith("/suppliers") ?? false)}
          >
            Suppliers
          </Link>
          <Link href="/orders" className={navLinkClassName(pathname?.startsWith("/orders") ?? false)}>
            Orders
          </Link>
        </nav>
        <div className="site-header__actions">
          {isHydrated && session ? (
            <>
              <span className="site-header__welcome">Welcome, {session.name ?? session.email}</span>
              <Link href={dashboardHref} className="button-primary">
                View Dashboard
              </Link>
              <button type="button" className="button-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="button-secondary">
                Log in
              </Link>
              <Link href="/register" className="button-primary">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
