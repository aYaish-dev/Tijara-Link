import Link from "next/link";

import { api, ApiOrder, ApiReview, SupplierReviewsPayload } from "@/lib/api";

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

export default async function AdminReviewsPage() {
  let orders: ApiOrder[] = [];
  let error: string | null = null;

  try {
    orders = await api.listOrders();
  } catch (err) {
    console.error("Failed to list orders for reviews", err);
    error = (err as Error)?.message || "Unable to load reviews";
  }

  const supplierIds = Array.from(
    new Set(
      orders.map((order) => order.supplierId).filter((value): value is string => Boolean(value))
    )
  );

  const supplierPayloads = await Promise.all(
    supplierIds.map(async (supplierId) => {
      try {
        const payload: SupplierReviewsPayload = await api.listSupplierReviews(supplierId);
        return { supplierId, payload };
      } catch (err) {
        console.error("Failed to list reviews for supplier", supplierId, err);
        return null;
      }
    })
  );

  const summaries = supplierPayloads
    .filter((entry): entry is { supplierId: string; payload: SupplierReviewsPayload } => Boolean(entry))
    .map((entry) => ({
      supplierId: entry.supplierId,
      avg: entry.payload.avg,
      count: entry.payload.reviews.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  const rows = supplierPayloads
    .filter((entry): entry is { supplierId: string; payload: SupplierReviewsPayload } => Boolean(entry))
    .flatMap((entry) =>
      entry.payload.reviews.map((review: ApiReview) => ({
        supplierId: entry.supplierId,
        review,
      }))
    )
    .sort((a, b) => {
      const aDate = a.review.createdAt ? new Date(a.review.createdAt).getTime() : 0;
      const bDate = b.review.createdAt ? new Date(b.review.createdAt).getTime() : 0;
      return bDate - aDate;
    });

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Supplier trust</p>
          <h1>Reviews</h1>
        </div>
        <Link className="button-secondary" href="/admin">
          ← Back to admin
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card card--compact">
        <div className="section-heading">
          <div>
            <h2>Average ratings</h2>
            <p className="section-subtitle">Top-level view of supplier satisfaction.</p>
          </div>
        </div>

        {summaries.length ? (
          <ul className="list-grid">
            {summaries.map((summary) => (
              <li key={summary.supplierId} className="scorecard">
                <div>
                  <p className="eyebrow">{summary.supplierId}</p>
                  <p className="scorecard__value">{summary.avg.toFixed(2)}</p>
                </div>
                <span className="scorecard__meta">{summary.count} reviews</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>No reviews captured</h3>
            <p>Collect feedback from orders after delivery to populate this list.</p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Individual reviews</h2>
            <p className="section-subtitle">Inspect feedback shared by buyers for each order.</p>
          </div>
          <span className="badge-inline">{rows.length} reviews</span>
        </div>

        {rows.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Order</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.supplierId}-${row.review.orderId}-${index}`}>
                    <td className="mono">{row.supplierId}</td>
                    <td>{row.review.rating}</td>
                    <td>{row.review.text || "—"}</td>
                    <td>
                      <Link className="link-muted" href={`/orders/${row.review.orderId || ""}`}>
                        {row.review.orderId || "—"}
                      </Link>
                    </td>
                    <td>{formatDate(row.review.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No feedback logged</h3>
            <p>Once buyers submit reviews they will be listed here for auditing.</p>
          </div>
        )}
      </section>
    </main>
  );
}
