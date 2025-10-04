import Link from "next/link";

import { api, ApiQuote, ApiRfq } from "@/lib/api";

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

function toStatusKey(value?: string | null) {
  return String(value || "").toUpperCase();
}

export default async function AdminRfqPage() {
  let rfqs: ApiRfq[] = [];
  let error: string | null = null;
  const quotes: Record<string, ApiQuote[]> = {};

  try {
    rfqs = await api.listRfq();
  } catch (err) {
    console.error("Failed to load RFQs", err);
    error = (err as Error)?.message || "Unable to load RFQs";
  }

  await Promise.all(
    rfqs.map(async (rfq) => {
      try {
        quotes[rfq.id] = await api.listQuotesByRfq(rfq.id);
      } catch (err) {
        console.error("Failed to load quotes for RFQ", rfq.id, err);
        quotes[rfq.id] = [];
      }
    })
  );

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">RFQ administration</p>
          <h1>All RFQs</h1>
        </div>
        <Link className="button-secondary" href="/admin">
          ← Back to admin
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Pipeline</h2>
            <p className="section-subtitle">Review sourcing demand and jump into supplier collaboration.</p>
          </div>
          <span className="badge-inline">{rfqs.length} RFQs</span>
        </div>

        {rfqs.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Quotes</th>
                  <th>Destination</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => {
                  const rfqQuotes = quotes[rfq.id] || [];
                  const accepted = rfqQuotes.filter((quote) => /ACCEPTED/.test(toStatusKey(quote.status))).length;

                  return (
                    <tr key={rfq.id}>
                      <td className="mono">{rfq.id}</td>
                      <td>{rfq.title}</td>
                      <td>{rfq.status || "OPEN"}</td>
                      <td>
                        {accepted}/{rfqQuotes.length}
                      </td>
                      <td>{rfq.destinationCountry || "—"}</td>
                      <td>{formatDate(rfq.createdAt)}</td>
                      <td>
                        <Link className="link-muted" href={`/rfq/${rfq.id}`}>
                          View quotes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No RFQs available</h3>
            <p>Use the buyer workspace to publish the first request for quote.</p>
          </div>
        )}
      </section>
    </main>
  );
}
