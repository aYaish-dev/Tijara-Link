// apps/web/app/suppliers/page.tsx
import Link from "next/link";

import { api } from "@/lib/api";

import { SUPPLIER_PROFILES, type SupplierProfile } from "./data";

export const dynamic = "force-dynamic";

type SupplierWithRating = SupplierProfile & { rating: number | null; reviewCount: number };

async function withReviews(): Promise<SupplierWithRating[]> {
  return Promise.all(
    SUPPLIER_PROFILES.map(async (supplier) => {
      try {
        const reviews = await api.listSupplierReviews(supplier.companyId);
        return {
          ...supplier,
          rating: reviews.avg,
          reviewCount: reviews.reviews.length,
        };
      } catch (error) {
        console.warn(`Unable to fetch reviews for ${supplier.companyId}`, error);
        return {
          ...supplier,
          rating: null,
          reviewCount: 0,
        };
      }
    }),
  );
}

export default async function SuppliersPage() {
  const suppliers = await withReviews();

  return (
    <main className="detail-page suppliers-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Supplier network</p>
          <h1>Trusted exporters ready to collaborate</h1>
          <p className="section-subtitle">
            Every supplier listed below operates inside TijaraLink&apos;s compliance framework with escrow-backed fulfilment and
            transparent milestone tracking.
          </p>
        </div>
        <Link className="button-primary" href="/register?role=seller">
          Become a supplier
        </Link>
      </header>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Featured suppliers</h2>
            <p className="section-subtitle">Review capabilities, response times, and quality scores at a glance.</p>
          </div>
        </div>

        <div className="supplier-grid">
          {suppliers.map((supplier) => (
            <article key={supplier.companyId} className="supplier-card">
              <header className="supplier-card__header">
                <div>
                  <h3>{supplier.name}</h3>
                  <p>{supplier.location}</p>
                </div>
                <div className="supplier-card__rating">
                  {typeof supplier.rating === "number" ? (
                    <span>
                      ★ {supplier.rating.toFixed(1)} <small>({supplier.reviewCount})</small>
                    </span>
                  ) : (
                    <span>New to TijaraLink</span>
                  )}
                </div>
              </header>
              <p className="supplier-card__description">{supplier.description}</p>
              <p className="supplier-card__highlight">{supplier.highlights}</p>
              <ul className="supplier-tags">
                {supplier.focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <footer className="supplier-card__footer">
                <span className="badge-inline">Response time {supplier.responseTime}</span>
                <Link className="button-tertiary" href={`/suppliers/${supplier.companyId}`}>
                  View profile
                </Link>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
