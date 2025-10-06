import Link from "next/link";

import AcceptQuoteButton from "@/app/components/AcceptQuoteButton";
import CreateOrderButton from "@/app/components/CreateOrderButton";
import ReleaseEscrowButton from "@/app/components/ReleaseEscrowButton";
import { api, type ApiOrder, type ApiQuote, type ApiRfq } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatCurrency(valueMinor?: number, currency?: string | null) {
  if (valueMinor == null) return "—";
  const amount = valueMinor / 100;
  return `${currency || "USD"} ${amount.toFixed(2)}`;
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

function statusBadge(status?: string | null) {
  const normalized = String(status || "pending").toLowerCase();
  if (/(accepted|approved|awarded)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(closed|cancel|reject)/.test(normalized)) return "status-pill status-pill--closed";
  if (/(draft)/.test(normalized)) return "status-pill status-pill--draft";
  return "status-pill status-pill--pending";
}

function groupOrdersByQuote(orders: ApiOrder[]) {
  return orders.reduce<Record<string, ApiOrder>>((acc, order) => {
    const quoteId = (order as ApiOrder & { quoteId?: string }).quoteId;
    if (quoteId) {
      acc[quoteId] = order;
    }
    return acc;
  }, {});
}

export default async function BuyerRfqDetails({ params }: { params: { id: string } }) {
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
      <section className="card empty-state" style={{ alignItems: "center", gap: "12px" }}>
        <h1 style={{ margin: 0 }}>RFQ not found</h1>
        <p style={{ margin: 0 }}>We couldn't locate this request. Try returning to the dashboard and selecting another RFQ.</p>
        <Link className="button-secondary" href="/buyer/dashboard">
          ← Back to dashboard
        </Link>
      </section>
    );
  }

  let quotes: ApiQuote[] = [];
  try {
    quotes = await api.listQuotesByRfq(id);
  } catch (error) {
    console.error("Failed to load quotes", error);
  }

  let orders: ApiOrder[] = [];
  try {
    orders = await api.listOrders();
  } catch (error) {
    console.error("Failed to load orders", error);
  }

  const ordersByQuote = groupOrdersByQuote(orders);

  return (
    <>
      <section className="card hero">
        <div className="hero__content">
          <span className="hero__eyebrow">RFQ #{rfq.id}</span>
          <h1 className="hero__title">{rfq.title || "Untitled RFQ"}</h1>
          <p className="hero__subtitle">
            Destination: {rfq.destinationCountry || "—"} • Status: {rfq.status || "Pending"} • Created {formatDate(rfq.createdAt)}
          </p>
          <div className="cta-row">
            <Link className="button-primary" href="/buyer/dashboard">
              ← Back to dashboard
            </Link>
            <a className="button-secondary" href="#quote-actions">
              Jump to quote actions
            </a>
          </div>
        </div>
      </section>

      <section id="quote-actions" className="card card--compact">
        <div className="section-heading">
          <div>
            <h2>Supplier quotes</h2>
            <p className="section-subtitle">
              Accept a quote to notify the supplier, then convert it into an order to trigger escrow and fulfilment workflows.
            </p>
          </div>
          <span className="badge-inline">{quotes.length} submissions</span>
        </div>

        {quotes.length ? (
          <ul className="list-grid">
            {quotes.map((quote) => {
              const linkedOrder = ordersByQuote[quote.id];
              const escrow = linkedOrder?.escrow ?? null;
              const isEscrowReleased = escrow?.released;

              return (
                <li key={quote.id} className="card quote-card">
                  <div className="quote-card__header">
                    <span className="quote-card__price">{formatCurrency(quote.pricePerUnitMinor, quote.currency)}</span>
                    <span className={statusBadge(quote.status)}>{quote.status || "Pending"}</span>
                  </div>

                  <dl className="quote-meta">
                    <div>
                      <dt>Supplier</dt>
                      <dd>{quote.supplierId || "—"}</dd>
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
                    {!linkedOrder && (
                      <CreateOrderButton
                        quoteId={quote.id}
                        totalMinor={quote.pricePerUnitMinor}
                        currency={quote.currency}
                      />
                    )}
                  </div>

                  {linkedOrder && (
                    <div className="quote-card__order">
                      <div className="quote-card__order-header">
                        <div>
                          <p className="eyebrow">Order #{linkedOrder.id}</p>
                          <p className="section-subtitle">
                            Status: {linkedOrder.status || "Pending"} • Total {formatCurrency(linkedOrder.totalMinor, linkedOrder.totalCurrency)}
                          </p>
                        </div>
                        <Link className="button-secondary" href={`/orders/${linkedOrder.id}`}>
                          View order ↗
                        </Link>
                      </div>

                      {escrow ? (
                        <div className="quote-card__escrow">
                          <div>
                            <p className="eyebrow">Escrow held</p>
                            <p className="info-value">{formatCurrency(escrow.heldMinor, escrow.currency)}</p>
                          </div>
                          <div>
                            <p className="eyebrow">Released</p>
                            <p className="info-value">{isEscrowReleased ? "Yes" : "No"}</p>
                          </div>
                          {!isEscrowReleased && <ReleaseEscrowButton orderId={linkedOrder.id} />}
                        </div>
                      ) : (
                        <p className="section-subtitle" style={{ marginTop: "16px" }}>
                          Escrow will appear once funds are deposited for this order.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>No quotes yet</h3>
            <p>Suppliers can respond via the /quotes API. Refresh after they submit their proposals.</p>
          </div>
        )}
      </section>
    </>
  );
}
