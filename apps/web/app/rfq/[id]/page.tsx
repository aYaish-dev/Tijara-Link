import Link from "next/link";

import { api } from "../../../lib/api";
import type { ApiQuote, ApiRfq } from "../../../lib/api";
import AcceptQuoteButton from "../../components/AcceptQuoteButton";
import CreateOrderButton from "../../components/CreateOrderButton";

export const dynamic = "force-dynamic";

function formatAmount(quote: ApiQuote) {
  const currency = quote.currency || "USD";
  const amount = (quote.pricePerUnitMinor ?? 0) / 100;
  return `${currency} ${amount.toFixed(2)}`;
}

function statusBadge(status?: string | null) {
  const normalized = String(status || "pending").toLowerCase();
  if (/(accepted|approved|awarded)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(closed|cancel|reject)/.test(normalized)) return "status-pill status-pill--closed";
  return "status-pill status-pill--pending";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function RfqDetails({ params }: { params: { id: string } }) {
  const { id } = params;

  let rfq: ApiRfq | undefined;
  try {
    const rfqs = await api.listRfq();
    rfq = rfqs.find((entry) => entry.id === id);
  } catch (error) {
    console.error("Failed to fetch RFQ list", error);
  }

  if (!rfq) {
    return (
      <main className="detail-page">
        <header className="detail-header">
          <div>
            <p className="eyebrow">RFQ not found</p>
            <h1>{id}</h1>
          </div>
          <Link className="button-secondary" href="/rfq">
            ← All RFQs
          </Link>
        </header>
        <div className="alert alert--error">We could not locate this request for quote.</div>
      </main>
    );
  }

  let quotes: ApiQuote[] = [];
  try {
    quotes = await api.listQuotesByRfq(id);
  } catch (error) {
    console.error("Failed to load quotes", error);
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">RFQ #{rfq.id}</p>
          <h1>{rfq.title}</h1>
          <p className="section-subtitle">
            Destination: {rfq.destinationCountry || "—"} • Status: {rfq.status || "Pending"} • Created {formatDate(rfq.createdAt)}
          </p>
        </div>
        <Link className="button-secondary" href="/">
          ← Back to overview
        </Link>
      </header>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Supplier quotes</h2>
            <p className="section-subtitle">
              Accept a quote to notify the supplier or create an order to continue to escrow and fulfilment.
            </p>
          </div>
          <span className="badge-inline">{quotes.length} submissions</span>
        </div>

        {quotes.length ? (
          <ul className="list-grid">
            {quotes.map((quote) => (
              <li key={quote.id} className="card quote-card">
                <div className="quote-card__header">
                  <span className="quote-card__price">{formatAmount(quote)}</span>
                  <span className={statusBadge(quote.status)}>{quote.status || "Pending"}</span>
                </div>
                <dl className="quote-meta">
                  <div>
                    <dt>Supplier</dt>
                    <dd>{quote.supplierCompanyId || quote.supplierId || "—"}</dd>
                  </div>
                  <div>
                    <dt>MOQ</dt>
                    <dd>{quote.moq ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Lead time</dt>
                    <dd>{quote.leadTimeDays ? `${quote.leadTimeDays} days` : "—"}</dd>
                  </div>
                </dl>
                <div className="quote-card__footer">
                  <AcceptQuoteButton quoteId={quote.id} />
                  <CreateOrderButton
                    quoteId={quote.id}
                    totalMinor={quote.pricePerUnitMinor}
                    currency={quote.currency}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>No quotes yet</h3>
            <p>Suppliers can submit proposals via the POST /quotes endpoint. Refresh once they respond.</p>
          </div>
        )}
      </section>
    </main>
  );
}
