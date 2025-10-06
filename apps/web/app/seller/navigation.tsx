"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
};

type Props = {
  items: NavigationItem[];
};

export function SellerNavigation({ items }: Props) {
  const pathname = usePathname();

  return (
    <nav className="seller-nav" aria-label="Seller navigation">
      <ul>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive ? "seller-nav__link seller-nav__link--active" : "seller-nav__link"}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
