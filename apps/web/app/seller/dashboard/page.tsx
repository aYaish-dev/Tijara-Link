import Link from "next/link";

import QuoteSubmissionForm from "../components/QuoteSubmissionForm";
import { mockSellerSession } from "../layout";
import { api, ApiRfq } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeStatus(value?: string | null) {
  return String(value || "").toUpperCase();
}

function statusClassName(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (/(APPROVED|ACCEPTED|ACTIVE|AWARDED)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(CLOSED|CANCELLED|CANCELED|REJECTED|EXPIRED)/.test(normalized)) return "status-pill status-pill--closed";
  if (/DRAFT/.test(normalized)) return "status-pill status-pill--draft";
  return "status-pill status-pill--pending";
}

function isOpenRfq(rfq: ApiRfq) {
  const status = normalizeStatus(rfq.status);
  return !/(CLOSED|CANCELLED|CANCELED|EXPIRED)/.test(status);
}

export default async function SellerDashboardPage() {
  const session = mockSellerSession;

  let rfqs: ApiRfq[] = [];
  let rfqError: string | null = null;

  try {
    rfqs = await api.listRfq();
  } catch (error) {
    console.error("Failed to load RFQs for seller dashboard", error);
    rfqError = (error as Error)?.message || "Unable to load RFQs";
  }

  const openRfqs = rfqs.filter(isOpenRfq);

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Supplier workspace</p>
          <h1>Seller dashboard</h1>
          <p className="section-subtitle">Respond to buyer demand, track open RFQs, and maintain fulfilment readiness.</p>
        </div>
        <div className="cta-row" style={{ justifyContent: "flex-end" }}>
          <Link className="button-secondary" href="/seller/contracts">
            Contracts
          </Link>
          <Link className="button-secondary" href="/seller/reviews">
            Reviews
          </Link>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Open RFQs</div>
          <div className="stat-card__value">{openRfqs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total RFQs</div>
          <div className="stat-card__value">{rfqs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Your company</div>
          <div className="stat-card__value" style={{ fontSize: "1rem" }}>
            {session.companyName}
          </div>
        </div>
      </section>

      {rfqError && <div className="alert alert--error">{rfqError}</div>}

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="section-heading">
            <div>
              <h2>Market opportunities</h2>
              <p className="section-subtitle">Review buyer requirements and choose where to submit a proposal.</p>
            </div>
            <span className="badge-inline">{openRfqs.length} open</span>
          </div>

          {openRfqs.length ? (
            <div className="table-wrapper">
              <table className="rfq-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Destination</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {openRfqs.map((rfq) => (
                    <tr key={rfq.id}>
                      <td>{rfq.title}</td>
                      <td>
                        <span className={statusClassName(rfq.status)}>{rfq.status || "Pending"}</span>
                      </td>
                      <td>{rfq.destinationCountry || "—"}</td>
                      <td>{formatDate(rfq.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No open RFQs</h3>
              <p>Buyers will publish new opportunities here once they are ready for supplier quotes.</p>
            </div>
          )}
        </div>

        <aside className="card card--compact">
          <div className="form-card__title">Submit a quote</div>
          <p className="form-card__subtitle">
            Choose an RFQ and enter your pricing, minimum order quantity, and lead time to respond instantly.
          </p>
          <QuoteSubmissionForm rfqs={openRfqs} />
          <p className="footer-note" style={{ marginTop: "24px" }}>
            Need to check existing quotes? Visit the buyer RFQ detail view after submitting to monitor status.
          </p>
        </aside>
      </section>
    </main>
  );
}
