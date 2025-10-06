"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useRequireRole } from "../../hooks/useRequireRole";
import { api, type ApiReview, type SupplierReviewsPayload } from "@/lib/api";

type ReviewRow = { supplierId: string; review: ApiReview };
type ReviewSummary = { supplierId: string; avg: number; count: number };

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

export default function AdminReviewsPage() {
  const { canRender, isHydrated } = useRequireRole("admin", { redirectTo: "/admin/reviews" });
  const [summaries, setSummaries] = useState<ReviewSummary[]>([]);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!canRender) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const orders = await api.listOrders();
        if (cancelled) return;

        const supplierIds = Array.from(
          new Set(orders.map((order) => order.supplierId).filter((value): value is string => Boolean(value))),
        );

        const payloads: Array<({ supplierId: string } & SupplierReviewsPayload) | null> = await Promise.all(
          supplierIds.map(async (supplierId) => {
            try {
              const { reviews, avg } = await api.listSupplierReviews(supplierId);
              return { supplierId, reviews, avg };
            } catch (err) {
              console.error("Failed to list reviews for supplier", supplierId, err);
              return null;
            }
          }),
        );

        if (cancelled) return;

        const validPayloads = payloads.filter(
          (entry): entry is { supplierId: string } & SupplierReviewsPayload => Boolean(entry),
        );

        const summaryData = validPayloads
          .map((entry) => ({ supplierId: entry.supplierId, avg: entry.avg, count: entry.reviews.length }))
          .sort((a, b) => b.avg - a.avg);

        const reviewRows = validPayloads
          .flatMap((entry) => entry.reviews.map((review) => ({ supplierId: entry.supplierId, review })))
          .sort((a, b) => {
            const aDate = a.review.createdAt ? new Date(a.review.createdAt).getTime() : 0;
            const bDate = b.review.createdAt ? new Date(b.review.createdAt).getTime() : 0;
            return bDate - aDate;
          });

        setSummaries(summaryData);
        setRows(reviewRows);
      } catch (err) {
        console.error("Failed to load reviews", err);
        if (!cancelled) {
          setSummaries([]);
          setRows([]);
          setError((err as Error)?.message || "Unable to load reviews");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [canRender]);

  if (!isHydrated || !canRender) {
    return (
      <main className="detail-page">
        <header className="detail-header">
          <div>
            <p className="eyebrow">Reputation management</p>
            <h1>Reviews</h1>
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

        {isLoading ? (
          <div className="empty-state">
            <h3>Loading averages…</h3>
            <p>Aggregating submitted buyer feedback.</p>
          </div>
        ) : summaries.length ? (
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

        {isLoading ? (
          <div className="empty-state">
            <h3>Loading reviews…</h3>
            <p>Gathering submitted feedback.</p>
          </div>
        ) : rows.length ? (
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
                    <td>{row.review.text || row.review.comment || "—"}</td>
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

