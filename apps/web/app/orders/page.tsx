// apps/web/app/orders/page.tsx
import Link from "next/link";

import { api, ApiOrder } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatCurrency(totalMinor?: number, currency?: string | null) {
  if (typeof totalMinor !== "number") return "—";
  const amount = totalMinor / 100;
  return `${currency ?? "USD"} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

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

function statusVariant(status?: string | null) {
  const normalized = String(status ?? "draft").toLowerCase();
  if (/(delivered|completed|released)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(processing|customs|transit|active|in_progress)/.test(normalized)) return "status-pill status-pill--pending";
  if (/(cancel|rejected|failed)/.test(normalized)) return "status-pill status-pill--closed";
  return "status-pill status-pill--draft";
}

function summarizeTotals(orders: ApiOrder[]) {
  return orders.reduce(
    (acc, order) => {
      acc.total += (order.totalMinor ?? 0) / 100;
      if ((order.status ?? "").toLowerCase().includes("deliver")) {
        acc.delivered += 1;
      }
      if (!order.escrow?.released) {
        acc.escrowHeld += (order.escrow?.heldMinor ?? 0) / 100;
      }
      return acc;
    },
    { total: 0, delivered: 0, escrowHeld: 0 },
  );
}

export default async function OrdersPage() {
  let orders: ApiOrder[] = [];
  let error: string | null = null;

  try {
    orders = await api.listOrders();
  } catch (err) {
    console.error("Failed to load orders", err);
    error = (err as Error)?.message || "Unable to load orders";
  }

  const stats = summarizeTotals(orders);

  return (
    <main className="detail-page orders-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>Orders & fulfilment</h1>
          <p className="section-subtitle">
            Track every stage from quote acceptance to delivery. Connect logistics and compliance in a single workspace.
          </p>
        </div>
        <Link className="button-secondary" href="/rfq">
          ← Back to RFQs
        </Link>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <section className="card orders-summary">
        <div className="stat-row">
          <div className="stat-card">
            <p className="eyebrow">Active orders</p>
            <p className="stat-card__value">{orders.length}</p>
            <p className="stat-card__hint">Synced directly from the TijaraLink API.</p>
          </div>
          <div className="stat-card">
            <p className="eyebrow">Total value</p>
            <p className="stat-card__value">USD {stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="stat-card__hint">Aggregate based on current order totals.</p>
          </div>
          <div className="stat-card">
            <p className="eyebrow">Delivered</p>
            <p className="stat-card__value">{stats.delivered}</p>
            <p className="stat-card__hint">Orders flagged as delivered or completed.</p>
          </div>
          <div className="stat-card">
            <p className="eyebrow">Escrow held</p>
            <p className="stat-card__value">USD {stats.escrowHeld.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="stat-card__hint">Funds available for release once customs clears.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Orders</h2>
            <p className="section-subtitle">Dive into each order to release escrow, update shipments, or sign contracts.</p>
          </div>
        </div>

        {orders.length ? (
          <div className="table-wrapper">
            <table className="rfq-table orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Buyer</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">{order.id}</td>
                    <td>
                      <span className={statusVariant(order.status)}>{order.status ?? "Pending"}</span>
                    </td>
                    <td>{order.buyerCompanyId ?? order.buyerId ?? "—"}</td>
                    <td>{order.supplierCompanyId ?? order.supplierId ?? "—"}</td>
                    <td>{formatCurrency(order.totalMinor, order.totalCurrency)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <Link className="link-muted" href={`/orders/${order.id}`}>
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Accept a supplier quote to convert it into an order and track fulfilment from this dashboard.</p>
            <Link className="button-primary" href="/rfq">
              Review RFQs
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
