// apps/web/app/page.tsx
import { api, API_BASE, type ApiRfq } from "@/lib/api";
import NewRfqForm from "./components/NewRfqForm";
import HeroCtaButtons from "./components/HeroCtaButtons";

export const dynamic = "force-dynamic";

function statusClassName(status?: string | null) {
  const normalized = String(status || "pending").toLowerCase();
  if (/(approved|accepted|active|awarded)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(closed|cancelled|canceled|rejected|expired)/.test(normalized)) return "status-pill status-pill--closed";
  if (/(draft)/.test(normalized)) return "status-pill status-pill--draft";
  return "status-pill status-pill--pending";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

export default async function Home() {
  let rfqs: ApiRfq[] = [];
  try {
    rfqs = await api.listRfq();
  } catch (err) {
    // بنعرض الصفحة حتى لو الـ API وقع
    console.error("Failed to load RFQs", err);
    rfqs = [];
  }

  const totalRfqs = rfqs.length;
  const activeRfqs = rfqs.filter((r) =>
    String(r.status || "").toLowerCase().match(/pending|review|submitted|active|accepted/)
  ).length;
  const fulfilledRfqs = rfqs.filter((r) =>
    String(r.status || "").toLowerCase().match(/closed|awarded|completed|delivered/)
  ).length;

  return (
    <main className="page">
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">TijaraLink Platform</span>
          <h1 className="hero__title">Procurement visibility and supplier collaboration in one elegant hub.</h1>
          <p className="hero__subtitle">
            Monitor every request-for-quote, engage trusted partners, and move from sourcing to awarding with total confidence.
          </p>
          <div className="cta-row">
            <HeroCtaButtons />
            <a className="button-secondary" href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
              API Health Endpoint
            </a>
          </div>
        </div>
        <div className="badge-inline" style={{ alignSelf: "flex-start" }}>
          <span role="img" aria-hidden>🔒</span>
          Secure workflows with escrow-ready orders
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Open RFQs</div>
          <div className="stat-card__value">{activeRfqs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Fulfilled</div>
          <div className="stat-card__value">{fulfilledRfqs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Requests</div>
          <div className="stat-card__value">{totalRfqs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">API Endpoint</div>
          <div className="stat-card__value" style={{ fontSize: "1rem" }}>
            <a href={`${API_BASE}/rfq`} className="link-muted" target="_blank" rel="noreferrer">/rfq</a>
          </div>
        </div>
      </section>

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="hero__content" style={{ maxWidth: "100%", gap: "8px" }}>
            <span className="badge-inline" style={{ marginBottom: "12px" }}>
              <span role="img" aria-hidden>📊</span>
              Live Pipeline
            </span>
            <h2 className="hero__title" style={{ fontSize: "2rem" }}>Active Requests for Quote</h2>
            <p className="hero__subtitle" style={{ fontSize: "1rem" }}>
              Track statuses, due dates, and destinations at a glance.
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
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((r) => (
                    <tr key={r.id}>
                      <td>{r.title}</td>
                      <td><span className={statusClassName(r.status)}>{r.status || "Pending"}</span></td>
                      <td>{r.destinationCountry || "—"}</td>
                      <td>{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3 style={{ marginBottom: "8px" }}>No RFQs yet</h3>
              <p style={{ margin: 0 }}>Create your first request to start collaborating with suppliers.</p>
            </div>
          )}
        </div>

        <aside id="create-rfq" className="card card--compact">
          <div className="form-card__title">Launch a new RFQ</div>
          <p className="form-card__subtitle">
            Share your sourcing requirements with verified suppliers and receive quotes without friction.
          </p>
          <NewRfqForm />
          <p className="footer-note" style={{ marginTop: "24px" }}>
            Need to integrate programmatically? Explore the{" "}
            <a href={`${API_BASE}/docs`} className="link-muted" target="_blank" rel="noreferrer">
              developer docs
            </a>.
          </p>
        </aside>
      </section>
    </main>
  );
}
