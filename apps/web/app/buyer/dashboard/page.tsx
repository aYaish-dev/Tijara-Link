import Link from "next/link";

import NewRfqForm from "@/app/components/NewRfqForm";
import { api, type ApiRfq } from "@/lib/api";

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

function statusPill(status?: string | null) {
  const normalized = String(status || "pending").toLowerCase();
  if (/(accepted|awarded|approved|active)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(closed|cancel|reject|expired)/.test(normalized)) return "status-pill status-pill--closed";
  if (/(draft)/.test(normalized)) return "status-pill status-pill--draft";
  return "status-pill status-pill--pending";
}

export default async function BuyerDashboardPage() {
  let rfqs: ApiRfq[] = [];
  let error: string | null = null;

  try {
    rfqs = await api.listRfq();
  } catch (err) {
    console.error("Failed to load RFQs", err);
    error = (err as Error)?.message || "Unable to load RFQs";
  }

  const openRfqs = rfqs.filter((rfq) => !/(closed|cancelled|canceled)/i.test(String(rfq.status || ""))).length;
  const closedRfqs = rfqs.length - openRfqs;

  return (
    <>
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Buyer control center</span>
          <h1 className="hero__title">Track sourcing requests and engage suppliers with confidence.</h1>
          <p className="hero__subtitle">
            Monitor the health of every RFQ, nudge suppliers when responses lag, and convert accepted quotes into escrow-backed
            orders.
          </p>
          <div className="cta-row">
            <a className="button-primary" href="#buyer-new-rfq">
              Create New RFQ
            </a>
            <Link className="button-secondary" href="/">
              ← Back to platform overview
            </Link>
          </div>
        </div>
        <div className="badge-inline" style={{ alignSelf: "flex-start" }}>
          <span role="img" aria-hidden>
            📬
          </span>
          Share requirements and collect supplier proposals in minutes
        </div>
      </section>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Open RFQs</div>
          <div className="stat-card__value">{openRfqs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Closed RFQs</div>
          <div className="stat-card__value">{closedRfqs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total RFQs</div>
          <div className="stat-card__value">{rfqs.length}</div>
        </div>
      </section>

      <section id="buyer-new-rfq" className="card card--compact">
        <div className="section-heading" style={{ marginBottom: "16px" }}>
          <div>
            <h2>Launch a new sourcing request</h2>
            <p className="section-subtitle">
              Capture the essentials for suppliers—title, scope, and destination. Submitting this form calls the existing
              createRfq API.
            </p>
          </div>
        </div>
        <NewRfqForm />
      </section>

      <section className="card card--compact">
        <div className="section-heading">
          <div>
            <h2>Recent RFQs</h2>
            <p className="section-subtitle">Review the latest activity and drill into quotes for deeper collaboration.</p>
          </div>
          <span className="badge-inline">{rfqs.length} records</span>
        </div>

        {rfqs.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Destination</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => (
                  <tr key={rfq.id}>
                    <td>{rfq.title || "Untitled RFQ"}</td>
                    <td>
                      <span className={statusPill(rfq.status)}>{rfq.status || "Pending"}</span>
                    </td>
                    <td>{rfq.destinationCountry || "—"}</td>
                    <td>{formatDate(rfq.createdAt)}</td>
                    <td>
                      <Link className="link-muted" href={`/buyer/rfq/${rfq.id}`}>
                        View quotes ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No RFQs yet</h3>
            <p>Publish your first request to start collecting supplier quotes.</p>
          </div>
        )}
      </section>
    </>
  );
}
