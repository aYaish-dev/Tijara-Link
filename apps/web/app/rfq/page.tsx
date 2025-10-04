import Link from "next/link";

import { api } from "../../lib/api";
import type { ApiRfq } from "../../lib/api";

export const dynamic = "force-dynamic";

function formatDate(input?: string | null) {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function RfqIndexPage() {
  let rfqs: ApiRfq[] = [];
  let error: string | null = null;

  try {
    rfqs = await api.listRfq();
  } catch (err) {
    console.error(err);
    error = (err as Error)?.message || "Unable to load RFQs";
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Buyer workspace</p>
          <h1>Requests for quote</h1>
        </div>
        <Link className="button-primary" href="/">
          ← Back to overview
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Live RFQs</h2>
            <p className="section-subtitle">
              All demand captured from buyers. Open any request to inspect supplier quotes.
            </p>
          </div>
          <span className="badge-inline">{rfqs.length} total</span>
        </div>

        {rfqs.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>ID</th>
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
                    <td className="mono">{rfq.id}</td>
                    <td>{rfq.title}</td>
                    <td>{rfq.status || "Pending"}</td>
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
            <h3>No RFQs registered yet</h3>
            <p>Publish a request from the landing page to begin receiving supplier responses.</p>
          </div>
        )}
      </section>
    </main>
  );
}
