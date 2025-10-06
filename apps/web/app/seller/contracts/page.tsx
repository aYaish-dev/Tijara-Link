import Link from "next/link";

import SignContractButton from "@/app/components/SignContractButton";
import { api, ApiOrder } from "@/lib/api";

import { mockSellerSession } from "../layout";

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

export default async function SellerContractsPage() {
  const session = mockSellerSession;

  let orders: ApiOrder[] = [];
  let error: string | null = null;

  try {
    orders = await api.listOrders();
  } catch (err) {
    console.error("Failed to load orders for seller contracts", err);
    error = (err as Error)?.message || "Unable to load contracts";
  }

  const relevantOrders = orders.filter((order) => order.supplierCompanyId === session.companyId && order.contract);
  const pendingContracts = relevantOrders.filter((order) => !order.contract?.supplierSignedAt);
  const completedContracts = relevantOrders.filter((order) => order.contract?.supplierSignedAt);

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Fulfilment</p>
          <h1>Contracts awaiting signature</h1>
          <p className="section-subtitle">Review finalized purchase terms and execute supplier signatures.</p>
        </div>
        <Link className="button-secondary" href="/seller/dashboard">
          ← Back to dashboard
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card card--compact">
        <div className="section-heading">
          <div>
            <h2>Pending contracts</h2>
            <p className="section-subtitle">Contracts ready for your signature to progress fulfilment.</p>
          </div>
          <span className="badge-inline">{pendingContracts.length}</span>
        </div>

        {pendingContracts.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Terms</th>
                  <th>Buyer signed</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingContracts.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">
                      <Link className="link-muted" href={`/orders/${order.id}`}>
                        {order.id}
                      </Link>
                    </td>
                    <td>{order.contract?.terms?.slice(0, 80) || "—"}</td>
                    <td>{order.contract?.buyerSignedAt ? formatDate(order.contract?.buyerSignedAt) : "Awaiting"}</td>
                    <td>{formatDate(order.contract?.createdAt)}</td>
                    <td>
                      {order.contract && <SignContractButton contractId={order.contract.id} role="supplier" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nothing to sign right now</h3>
            <p>Once buyers countersign, their contracts will appear here for supplier execution.</p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Completed contracts</h2>
            <p className="section-subtitle">Archive of agreements you have already signed.</p>
          </div>
          <span className="badge-inline">{completedContracts.length}</span>
        </div>

        {completedContracts.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Signed</th>
                  <th>Buyer signature</th>
                  <th>Terms</th>
                </tr>
              </thead>
              <tbody>
                {completedContracts.map((order) => (
                  <tr key={`${order.id}-completed`}>
                    <td className="mono">
                      <Link className="link-muted" href={`/orders/${order.id}`}>
                        {order.id}
                      </Link>
                    </td>
                    <td>{formatDate(order.contract?.supplierSignedAt)}</td>
                    <td>{formatDate(order.contract?.buyerSignedAt)}</td>
                    <td>{order.contract?.terms?.slice(0, 80) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No signed contracts yet</h3>
            <p>As soon as you sign an agreement it will move into this archive for easy reference.</p>
          </div>
        )}
      </section>
    </main>
  );
}
