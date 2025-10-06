// apps/web/app/suppliers/[companyId]/page.tsx
import Link from "next/link";

import { api } from "@/lib/api";

import { SUPPLIER_PROFILES } from "../data";

export const dynamic = "force-dynamic";

type Params = { params: { companyId: string } };

export default async function SupplierDetailPage({ params }: Params) {
  const supplier = SUPPLIER_PROFILES.find((item) => item.companyId === params.companyId);

  if (!supplier) {
    return (
      <main className="detail-page">
        <header className="detail-header">
          <div>
            <p className="eyebrow">Supplier profile</p>
            <h1>Profile not found</h1>
            <p className="section-subtitle">This supplier is not yet activated inside TijaraLink.</p>
          </div>
          <Link className="button-secondary" href="/suppliers">
            ← Back to suppliers
          </Link>
        </header>
      </main>
    );
  }

  let rating: number | null = null;
  let reviewCount = 0;
  try {
    const reviews = await api.listSupplierReviews(supplier.companyId);
    rating = reviews.avg;
    reviewCount = reviews.reviews.length;
  } catch (error) {
    console.warn(`Unable to fetch supplier reviews for ${supplier.companyId}`, error);
  }

  return (
    <main className="detail-page supplier-detail">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Supplier profile</p>
          <h1>{supplier.name}</h1>
          <p className="section-subtitle">
            {supplier.location} • Focused on {supplier.focus.join(", ")}. Response time {supplier.responseTime}.
          </p>
        </div>
        <Link className="button-secondary" href="/suppliers">
          ← Back to suppliers
        </Link>
      </header>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Capability snapshot</h2>
            <p className="section-subtitle">Operational depth based on latest onboarding audit.</p>
          </div>
          {typeof rating === "number" ? (
            <span className="badge-inline">Quality score ★ {rating.toFixed(1)} ({reviewCount})</span>
          ) : (
            <span className="badge-inline">New supplier</span>
          )}
        </div>

        <div className="supplier-detail__grid">
          <article>
            <h3>Core services</h3>
            <ul>
              {supplier.capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Compliance & certifications</h3>
            <ul>
              {supplier.compliance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Primary markets</h3>
            <ul>
              {supplier.markets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Work with {supplier.name.split(" ")[0]}</h2>
            <p className="section-subtitle">Initiate diligence, invite to RFQs, or schedule a discovery call.</p>
          </div>
        </div>
        <div className="supplier-detail__cta">
          <Link className="button-primary" href={`/rfq?prefillSupplier=${supplier.companyId}`}>
            Invite to an RFQ
          </Link>
          <Link className="button-tertiary" href="mailto:success@tijaralink.com">
            Arrange onboarding session
          </Link>
        </div>
      </section>
    </main>
  );
}
