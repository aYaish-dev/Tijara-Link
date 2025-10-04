import Link from "next/link";

import { api, ApiReview, SupplierReviewsPayload } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function SupplierReviewsPage({ params }: { params: { companyId: string } }) {
  const { companyId } = params;

  let payload: SupplierReviewsPayload | null = null;
  let error: string | null = null;

  try {
    payload = await api.listSupplierReviews(companyId);
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
          <p className="eyebrow">Supplier performance</p>
          <h1>Reviews for {companyId}</h1>
          <p className="section-subtitle">
            Average rating {average ? average.toFixed(2) : "–"} from {reviews.length} review{reviews.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link className="button-secondary" href="/">
          ← Back to overview
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card">
        {reviews.length ? (
          <ul className="list-stack">
            {reviews.map((review, index) => (
              <li key={`${review.orderId}-${index}`} className="review-card">
                <div className="review-card__header">
                  <span className="review-card__rating">{review.rating.toFixed(1)}</span>
                  <span className="review-card__meta">Order {review.orderId || "—"}</span>
                  <span className="review-card__meta">{formatDate(review.createdAt)}</span>
                </div>
                <p className="review-card__comment">{review.text || "No comment provided."}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>No reviews yet</h3>
            <p>Once buyers submit post-delivery feedback it will be displayed here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
