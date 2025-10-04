import Link from "next/link";

import { api, API_BASE, ApiRfq } from "@/lib/api";
import NewRfqForm from "./components/NewRfqForm";

export const dynamic = "force-dynamic";

function classifyStatus(status?: string | null) {
  if (!status) return "Pending";
  const normalized = status.toLowerCase();
  if (/(accepted|approved|awarded|active)/.test(normalized)) return "Active";
  if (/(closed|cancel|reject|expired)/.test(normalized)) return "Closed";
  if (/(draft)/.test(normalized)) return "Draft";
  return status;
}

function statusBadge(status?: string | null) {
  const normalized = String(status || "pending").toLowerCase();
  if (/(accepted|approved|awarded|active)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(closed|cancel|reject|expired)/.test(normalized)) return "status-pill status-pill--closed";
  if (/(draft)/.test(normalized)) return "status-pill status-pill--draft";
  return "status-pill status-pill--pending";
}

function formatDate(input?: string | null) {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function summariseRfqs(rfqs: ApiRfq[]) {
  const total = rfqs.length;
  const open = rfqs.filter((rfq) => {
    const status = (rfq.status || "").toLowerCase();
    return /(pending|review|submitted|active|accepted)/.test(status);
  }).length;
  const fulfilled = rfqs.filter((rfq) => {
    const status = (rfq.status || "").toLowerCase();
    return /(closed|awarded|completed|delivered)/.test(status);
  }).length;

  return { total, open, fulfilled };
}

export default async function Home() {
  let rfqs: ApiRfq[] = [];
  try {
    rfqs = await api.listRfq();
  } catch (error) {
    console.error("Failed to load RFQs", error);
  }

  const stats = summariseRfqs(rfqs);

  return (
    <main className="page">
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Supply Chain Control Center</span>
          <h1 className="hero__title">
            Orchestrate RFQs, supplier responses, and fulfilment milestones in one view.
          </h1>
          <p className="hero__subtitle">
            TijaraLink gives buyers, suppliers, and operators a shared workspace—from sourcing and quoting
            through orders, escrow, and delivery.
          </p>
          <div className="cta-row">
            <a className="button-primary" href="#create-rfq">
              Start a New RFQ
            </a>
            <a className="button-secondary" href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
              API Health Endpoint
            </a>
          </div>
        </div>
        <div className="badge-inline" style={{ alignSelf: "flex-start" }}>
          <span role="img" aria-hidden="true">
            🔄
          </span>
          Real-time updates using router.refresh()
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Open RFQs</div>
          <div className="stat-card__value">{stats.open}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Fulfilled</div>
          <div className="stat-card__value">{stats.fulfilled}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Requests</div>
          <div className="stat-card__value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">REST Endpoint</div>
          <div className="stat-card__value" style={{ fontSize: "1rem" }}>
            <a className="link-muted" href={`${API_BASE}/rfq`} target="_blank" rel="noreferrer">
              /rfq
            </a>
          </div>
        </div>
      </section>

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="hero__content" style={{ maxWidth: "100%", gap: "0.75rem" }}>
            <span className="badge-inline" style={{ marginBottom: "0.75rem" }}>
              <span role="img" aria-hidden="true">
                📈
              </span>
              Live pipeline
            </span>
            <h2 className="hero__title" style={{ fontSize: "2rem" }}>
              Active requests for quote
            </h2>
            <p className="hero__subtitle" style={{ fontSize: "1rem" }}>
              Review open demand, destinations, and creation dates. Jump directly into quote collaboration.
            </p>
          </div>

          {rfqs.length > 0 ? (
            <div className="table-wrapper">
              <table className="rfq-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Destination</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id}>
                      <td>{rfq.title}</td>
                      <td>
                        <span className={statusBadge(rfq.status)}>{classifyStatus(rfq.status)}</span>
                      </td>
                      <td>{rfq.destinationCountry || "—"}</td>
                      <td>{formatDate(rfq.createdAt)}</td>
                      <td>
                        <Link className="link-muted" href={`/rfq/${rfq.id}`}>
                          View quotes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3 style={{ marginBottom: "8px" }}>No RFQs yet</h3>
              <p style={{ margin: 0 }}>Create your first request to invite suppliers.</p>
            </div>
          )}
        </div>

        <aside id="create-rfq" className="card card--compact">
          <div className="form-card__title">Launch a new RFQ</div>
          <p className="form-card__subtitle">
            Share your sourcing requirements with verified suppliers and receive quotes without friction.
          </p>
          <NewRfqForm />
          <div className="divider" />
          <div className="quick-links">
            <span className="quick-links__label">Quick links</span>
            <div className="quick-links__items">
              <Link href="/rfq" className="quick-link">
                RFQ directory
              </Link>
              <Link href="/suppliers/demo-supplier/reviews" className="quick-link">
                Supplier reviews
              </Link>
              <a className="quick-link" href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">
                API docs
              </a>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
