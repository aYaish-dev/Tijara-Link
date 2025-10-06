import Link from "next/link";

import { api, ApiOrder, ApiQuote, ApiRfq, ApiShipment } from "@/lib/api";

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

function toStatusKey(value?: string | null) {
  return String(value || "").toUpperCase();
}

function describeOrders(orders: ApiOrder[]) {
  const placed = orders.length;
  const delivered = orders.filter((order) => /DELIVERED/.test(toStatusKey(order.status))).length;
  const withEscrowReleased = orders.filter((order) => order.escrow?.released).length;
  return { placed, delivered, withEscrowReleased };
}

function describeShipments(shipments: ApiShipment[]) {
  const atCustoms = shipments.filter((shipment) => /CUSTOMS/.test(toStatusKey(shipment.status))).length;
  const delivered = shipments.filter((shipment) => /DELIVERED/.test(toStatusKey(shipment.status))).length;
  return { atCustoms, delivered };
}

function collectQuotesByRfq(rfqs: ApiRfq[], allQuotes: Record<string, ApiQuote[]>) {
  return rfqs.map((rfq) => ({
    rfq,
    quotes: allQuotes[rfq.id] || [],
  }));
}

export default async function AdminDashboard() {
  let rfqs: ApiRfq[] = [];
  let rfqError: string | null = null;
  let orders: ApiOrder[] = [];
  let orderError: string | null = null;
  const quotesMap: Record<string, ApiQuote[]> = {};

  try {
    rfqs = await api.listRfq();
  } catch (error) {
    console.error("Failed to load RFQs", error);
    rfqError = (error as Error)?.message || "Unable to load RFQs";
  }

  await Promise.all(
    rfqs.map(async (rfq) => {
      try {
        quotesMap[rfq.id] = await api.listQuotesByRfq(rfq.id);
      } catch (error) {
        console.error("Failed to load quotes for", rfq.id, error);
        quotesMap[rfq.id] = [];
      }
    })
  );

  try {
    orders = await api.listOrders();
  } catch (error) {
    console.error("Failed to list orders", error);
    orderError = (error as Error)?.message || "Unable to load orders";
    orders = [];
  }

  const shipments: ApiShipment[] = orders.flatMap((order) => order.shipments);

  const rfqStats = {
    open: rfqs.filter((rfq) => !/CLOSED/.test(toStatusKey(rfq.status))).length,
    total: rfqs.length,
  };

  const quoteStats = Object.values(quotesMap).reduce(
    (acc, quotes) => {
      acc.total += quotes.length;
      acc.accepted += quotes.filter((quote) => /ACCEPTED/.test(toStatusKey(quote.status))).length;
      return acc;
    },
    { total: 0, accepted: 0 }
  );

  const orderStats = describeOrders(orders);
  const shipmentStats = describeShipments(shipments);

  const supplierIds = Array.from(
    new Set(
      orders.map((order) => order.supplierId).filter((value): value is string => Boolean(value))
    )
  );

  let supplierAverages: Array<{ id: string; avg: number; count: number }> = [];
  if (supplierIds.length) {
    const responses = await Promise.all(
      supplierIds.map(async (supplierId) => {
        try {
          const { reviews, avg } = await api.listSupplierReviews(supplierId);
          return { id: supplierId, avg, count: reviews.length };
        } catch (error) {
          console.error("Failed to load supplier reviews for", supplierId, error);
          return null;
        }
      })
    );

    supplierAverages = responses.filter((entry): entry is { id: string; avg: number; count: number } => Boolean(entry));
    supplierAverages.sort((a, b) => b.avg - a.avg);
  }

  const topSuppliers = supplierAverages.slice(0, 5);

  const rfqRows = collectQuotesByRfq(rfqs.slice(0, 6), quotesMap);
  const latestShipments = shipments.slice(0, 5);

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Operations control</p>
          <h1>Admin overview</h1>
          <p className="section-subtitle">
            Monitor RFQs, quotes, orders, and logistics from a single command center.
          </p>
        </div>
        <Link className="button-primary" href="/">
          ← Back to workspace
        </Link>
      </header>

      {(rfqError || orderError) && (
        <div className="alert alert--error">
          {rfqError && <div>RFQs: {rfqError}</div>}
          {orderError && <div>Orders: {orderError}</div>}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Open RFQs</div>
          <div className="stat-card__value">{rfqStats.open}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Quotes pending</div>
          <div className="stat-card__value">{quoteStats.total - quoteStats.accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Orders placed</div>
          <div className="stat-card__value">{orderStats.placed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Escrow released</div>
          <div className="stat-card__value">{orderStats.withEscrowReleased}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Shipments at customs</div>
          <div className="stat-card__value">{shipmentStats.atCustoms}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Shipments delivered</div>
          <div className="stat-card__value">{shipmentStats.delivered}</div>
        </div>
      </section>

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="section-heading">
            <div>
              <h2>Live RFQs</h2>
              <p className="section-subtitle">Most recent sourcing requests and response momentum.</p>
            </div>
            <Link className="link-muted" href="/admin/rfq">
              View all ↗
            </Link>
          </div>

          {rfqRows.length ? (
            <div className="table-wrapper">
              <table className="rfq-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Quotes</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rfqRows.map(({ rfq, quotes }) => {
                    const acceptedQuotes = quotes.filter((quote) => /ACCEPTED/.test(toStatusKey(quote.status))).length;
                    return (
                      <tr key={rfq.id}>
                        <td>{rfq.title}</td>
                        <td>{rfq.status || "OPEN"}</td>
                        <td>
                          {acceptedQuotes}/{quotes.length}
                        </td>
                        <td>{formatDate(rfq.createdAt)}</td>
                        <td>
                          <Link className="link-muted" href={`/rfq/${rfq.id}`}>
                            Manage RFQ
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
              <h3>No RFQs recorded</h3>
              <p>Publish a new request from the buyer workspace to populate this view.</p>
            </div>
          )}
        </div>

        <aside className="card card--compact">
          <div className="section-heading">
            <div>
              <h2>Top suppliers</h2>
              <p className="section-subtitle">Aggregated review scores (last {topSuppliers.length} suppliers).</p>
            </div>
            <Link className="link-muted" href="/admin/reviews">
              Open reviews ↗
            </Link>
          </div>

          {topSuppliers.length ? (
            <ul className="list-stack">
              {topSuppliers.map((supplier) => (
                <li key={supplier.id} className="scorecard">
                  <div>
                    <p className="eyebrow">{supplier.id}</p>
                    <p className="scorecard__value">{supplier.avg.toFixed(2)}</p>
                  </div>
                  <span className="scorecard__meta">{supplier.count} reviews</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h3>No supplier feedback yet</h3>
              <p>Collect buyer reviews once deliveries are completed.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Logistics pulse</h2>
            <p className="section-subtitle">Snapshot of in-flight shipments across all orders.</p>
          </div>
          <Link className="link-muted" href="/admin/shipments">
            Manage shipments ↗
          </Link>
        </div>

        {latestShipments.length ? (
          <ul className="list-grid">
            {latestShipments.map((shipment) => {
              const orderHref = shipment.orderId ? `/orders/${shipment.orderId}` : "/orders";
              return (
                <li key={shipment.id} className="card quote-card">
                  <div className="quote-card__header">
                    <span className="quote-card__price">{shipment.mode || "–"}</span>
                    <span className="status-pill status-pill--draft">{shipment.status || "BOOKED"}</span>
                  </div>
                  <dl className="quote-meta">
                    <div>
                      <dt>Order</dt>
                      <dd className="mono">{shipment.orderId || "—"}</dd>
                    </div>
                    <div>
                      <dt>Tracking</dt>
                      <dd>{shipment.tracking || "—"}</dd>
                    </div>
                  </dl>
                  <div className="quote-card__footer">
                    <Link className="link-muted" href={orderHref}>
                      View order
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>No shipments scheduled</h3>
            <p>Create shipments from any order to monitor logistics milestones.</p>
          </div>
        )}
      </section>

      <section className="card card--compact">
        <div className="section-heading">
          <div>
            <h2>Quick links</h2>
            <p className="section-subtitle">Jump straight into detailed administrative views.</p>
          </div>
        </div>
        <div className="quick-links__items">
          <Link href="/admin/rfq" className="quick-link">
            RFQ management
          </Link>
          <Link href="/admin/orders" className="quick-link">
            Orders board
          </Link>
          <Link href="/admin/shipments" className="quick-link">
            Shipments console
          </Link>
          <Link href="/admin/reviews" className="quick-link">
            Supplier reviews
          </Link>
        </div>
      </section>
    </main>
  );
}
