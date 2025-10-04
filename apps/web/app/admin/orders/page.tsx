import Link from "next/link";

import { api } from "../../../lib/api";
import type { ApiOrder } from "../../../lib/api";
import ReleaseEscrowButton from "../../components/ReleaseEscrowButton";

export const dynamic = "force-dynamic";

function formatCurrency(totalMinor?: number, currency?: string | null) {
  if (totalMinor == null) return "—";
  const amount = totalMinor / 100;
  return `${currency || "USD"} ${amount.toFixed(2)}`;
}

export default async function AdminOrdersPage() {
  let orders: ApiOrder[] = [];
  let error: string | null = null;

  try {
    orders = await api.listOrders();
  } catch (err) {
    console.error("Failed to list orders", err);
    error = (err as Error)?.message || "Unable to load orders";
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Order operations</p>
          <h1>Orders</h1>
        </div>
        <Link className="button-secondary" href="/admin">
          ← Back to admin
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Live orders</h2>
            <p className="section-subtitle">Track fulfilment, escrow, and documents.</p>
          </div>
          <span className="badge-inline">{orders.length} orders</span>
        </div>

        {orders.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Escrow</th>
                  <th>Shipments</th>
                  <th>Contract</th>
                  <th>Review</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const shipmentsCount = order.shipments?.length ?? 0;
                  const contractState = order.contract
                    ? order.contract.buyerSignedAt && order.contract.supplierSignedAt
                      ? "Signed"
                      : "Pending signatures"
                    : "Missing";
                  const reviewState = order.review ? `${order.review.rating}/5` : "Pending";

                  return (
                    <tr key={order.id}>
                      <td className="mono">{order.id}</td>
                      <td>{formatCurrency(order.totalMinor, order.totalCurrency)}</td>
                      <td>{order.status || "PLACED"}</td>
                      <td>
                        {order.escrow ? (
                          <div className="table-actions">
                            <span>{order.escrow.released ? "Released" : "Held"}</span>
                            {!order.escrow.released && <ReleaseEscrowButton orderId={order.id} />}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{shipmentsCount}</td>
                      <td>{contractState}</td>
                      <td>{reviewState}</td>
                      <td>
                        <Link className="link-muted" href={`/orders/${order.id}`}>
                          Open order
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
            <h3>No orders yet</h3>
            <p>Accept a supplier quote to generate the first order.</p>
          </div>
        )}
      </section>
    </main>
  );
}
