import Link from "next/link";

import { api, ApiReview, SupplierReviewsPayload } from "@/lib/api";

import { mockSellerSession } from "../session";

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

export default async function SellerReviewsPage() {
  const session = mockSellerSession;

  let payload: SupplierReviewsPayload | null = null;
  let error: string | null = null;

  try {
    payload = await api.listSupplierReviews(session.companyId);
  } catch (err) {
    console.error("Failed to load supplier reviews", err);
    error = (err as Error)?.message || "Unable to load reviews";
  }

  const reviews: ApiReview[] = payload?.reviews ?? [];
  const average = payload?.avg ?? 0;

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Reputation</p>
          <h1>Buyer feedback</h1>
          <p className="section-subtitle">Track the reviews buyers have shared about your fulfilment performance.</p>
        </div>
        <Link className="button-secondary" href="/seller/dashboard">
          ← Back to dashboard
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card card--compact">
        <div className="section-heading">
          <div>
            <h2>Average rating</h2>
            <p className="section-subtitle">Rolling score based on all captured reviews.</p>
          </div>
          <span className="badge-inline">{reviews.length} reviews</span>
        </div>

        <div className="review-scorecard">
          <div className="review-scorecard__value">{average.toFixed(2)}</div>
          <div className="review-scorecard__meta">Out of 5</div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Review log</h2>
            <p className="section-subtitle">Full history of buyer commentary linked to orders.</p>
          </div>
        </div>

        {reviews.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Order</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews
                  .slice()
                  .sort((a, b) => {
                    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return bDate - aDate;
                  })
                  .map((review, index) => (
                    <tr key={`${review.id || index}-${review.orderId || "unknown"}`}>
                      <td>{review.rating}</td>
                      <td>{review.comment || review.text || "—"}</td>
                      <td>
                        {review.orderId ? (
                          <Link className="link-muted" href={`/orders/${review.orderId}`}>
                            {review.orderId}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{formatDate(review.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No reviews collected</h3>
            <p>Feedback will appear after orders close and buyers submit their experience.</p>
          </div>
        )}
      </section>
    </main>
  );
}
