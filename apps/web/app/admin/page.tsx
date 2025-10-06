"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useRequireRole } from "../hooks/useRequireRole";
import { api, type ApiOrder, type ApiQuote, type ApiRfq, type ApiShipment } from "@/lib/api";

type QuotesMap = Record<string, ApiQuote[]>;

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

function collectQuotesByRfq(rfqs: ApiRfq[], allQuotes: QuotesMap) {
  return rfqs.map((rfq) => ({
    rfq,
    quotes: allQuotes[rfq.id] || [],
  }));
}

function useAdminData(canRender: boolean) {
  const [rfqs, setRfqs] = useState<ApiRfq[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [quotesMap, setQuotesMap] = useState<QuotesMap>({});
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!canRender) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setRfqError(null);
      setOrderError(null);

      try {
        const rfqResponse = await api.listRfq();
        if (!cancelled) {
          setRfqs(rfqResponse);
        }

        const quotesEntries = await Promise.all(
          rfqResponse.map(async (rfq) => {
            try {
              const quotes = await api.listQuotesByRfq(rfq.id);
              return [rfq.id, quotes] as const;
            } catch (error) {
              console.error("Failed to load quotes for", rfq.id, error);
              return [rfq.id, []] as const;
            }
          }),
        );

        if (!cancelled) {
          setQuotesMap(Object.fromEntries(quotesEntries));
        }
      } catch (error) {
        console.error("Failed to load RFQs", error);
        if (!cancelled) {
          setRfqError((error as Error)?.message || "Unable to load RFQs");
          setRfqs([]);
          setQuotesMap({});
        }
      }

      try {
        const orderResponse = await api.listOrders();
        if (!cancelled) {
          setOrders(orderResponse);
        }
      } catch (error) {
        console.error("Failed to list orders", error);
        if (!cancelled) {
          setOrderError((error as Error)?.message || "Unable to load orders");
          setOrders([]);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [canRender]);

  return { rfqs, orders, quotesMap, rfqError, orderError, isLoading };
}

export default function AdminDashboard() {
  const { canRender, isHydrated } = useRequireRole("admin", { redirectTo: "/admin" });
  const { rfqs, orders, quotesMap, rfqError, orderError, isLoading } = useAdminData(canRender);

  const shipments = useMemo(() => orders.flatMap((order) => order.shipments), [orders]);

  const rfqStats = useMemo(
    () => ({
      open: rfqs.filter((rfq) => !/CLOSED/.test(toStatusKey(rfq.status))).length,
      total: rfqs.length,
    }),
    [rfqs],
  );

  const quoteStats = useMemo(
    () =>
      Object.values(quotesMap).reduce(
        (acc, quotes) => {
          acc.total += quotes.length;
          acc.accepted += quotes.filter((quote) => /ACCEPTED/.test(toStatusKey(quote.status))).length;
          return acc;
        },
        { total: 0, accepted: 0 },
      ),
    [quotesMap],
  );

  const orderStats = useMemo(() => describeOrders(orders), [orders]);
  const shipmentStats = useMemo(() => describeShipments(shipments), [shipments]);

  const supplierAverages = useMemo(() => {
    const supplierIds = Array.from(
      new Set(orders.map((order) => order.supplierId).filter((value): value is string => Boolean(value))),
    );

    return supplierIds;
  }, [orders]);

  const [topSuppliers, setTopSuppliers] = useState<Array<{ id: string; avg: number; count: number }>>([]);

  useEffect(() => {
    if (!canRender) return;
    if (!supplierAverages.length) {
      setTopSuppliers([]);
      return;
    }

    let cancelled = false;

    async function loadSupplierReviews() {
      const responses = await Promise.all(
        supplierAverages.map(async (supplierId) => {
          try {
            const { reviews, avg } = await api.listSupplierReviews(supplierId);
            return { id: supplierId, avg, count: reviews.length };
          } catch (error) {
            console.error("Failed to load supplier reviews for", supplierId, error);
            return null;
          }
        }),
      );

      if (!cancelled) {
        const sorted = responses
          .filter((entry): entry is { id: string; avg: number; count: number } => Boolean(entry))
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 5);
        setTopSuppliers(sorted);
      }
    }

    loadSupplierReviews();

    return () => {
      cancelled = true;
    };
  }, [canRender, supplierAverages]);

  const rfqRows = useMemo(() => collectQuotesByRfq(rfqs.slice(0, 6), quotesMap), [quotesMap, rfqs]);
  const latestShipments = useMemo(() => shipments.slice(0, 5), [shipments]);

  if (!isHydrated || !canRender) {
    return (
      <main className="detail-page">
        <header className="detail-header">
          <div>
            <p className="eyebrow">Operations control</p>
            <h1>Admin overview</h1>
          </div>
        </header>
        <section className="card">
          <h2>Verifying access…</h2>
          <p>Please wait while we confirm your permissions.</p>
        </section>
      </main>
    );
  }

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

          {isLoading ? (
            <div className="empty-state">
              <h3>Loading RFQs…</h3>
              <p>Fetching the latest demand signals.</p>
            </div>
          ) : rfqRows.length ? (
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
                        <td>{rfq.status || "Pending"}</td>
                        <td>
                          {acceptedQuotes}/{quotes.length}
                        </td>
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
              <h3>No RFQs registered yet</h3>
              <p>Publish a request from the landing page to begin receiving supplier responses.</p>
            </div>
          )}
        </div>

        <aside className="card card--compact">
          <div className="section-heading">
            <div>
              <h2>Top-rated suppliers</h2>
              <p className="section-subtitle">Average ratings from verified buyer reviews.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <h3>Loading insights…</h3>
              <p>Crunching sentiment from recent orders.</p>
            </div>
          ) : topSuppliers.length ? (
            <ul className="dashboard-list">
              {topSuppliers.map((supplier) => (
                <li key={supplier.id}>
                  <span className="dashboard-link">
                    <span className="mono">{supplier.avg.toFixed(1)}</span> /5 · {supplier.count} reviews
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h3>No reviews yet</h3>
              <p>Reviews will appear once buyers share feedback.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="layout-grid">
        <div className="card card--compact">
          <div className="section-heading">
            <div>
              <h2>Latest shipments</h2>
              <p className="section-subtitle">Track how logistics teams are progressing.</p>
            </div>
            <Link className="link-muted" href="/admin/shipments">
              Manage shipments ↗
            </Link>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <h3>Loading shipments…</h3>
              <p>Checking the manifest for in-flight deliveries.</p>
            </div>
          ) : latestShipments.length ? (
            <div className="table-wrapper">
              <table className="rfq-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Tracking</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {latestShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="mono">{shipment.id}</td>
                      <td>{shipment.status || "BOOKED"}</td>
                      <td>{shipment.mode || "—"}</td>
                      <td>{shipment.tracking || "—"}</td>
                      <td>
                        <Link className="link-muted" href={`/orders/${shipment.orderId}`}>
                          View order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No shipments on file</h3>
              <p>Create orders to begin monitoring logistics.</p>
            </div>
          )}
        </div>

        <aside className="card card--compact">
          <div className="section-heading">
            <div>
              <h2>Quick links</h2>
              <p className="section-subtitle">Jump straight into detailed administrative views.</p>
            </div>
          </div>
          <div className="quick-links-grid">
            <Link href="/admin/rfq" className="quick-link">
              RFQs overview ↗
            </Link>
            <Link href="/admin/orders" className="quick-link">
              Orders & escrow ↗
            </Link>
            <Link href="/admin/shipments" className="quick-link">
              Logistics tracker ↗
            </Link>
            <Link href="/admin/reviews" className="quick-link">
              Reviews moderation ↗
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

