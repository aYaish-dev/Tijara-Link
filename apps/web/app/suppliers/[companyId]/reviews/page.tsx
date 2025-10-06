import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type ApiReview, type SupplierReviewsPayload } from "@/lib/api";

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

function averageRating(reviews: ApiReview[]) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
  return total / reviews.length;
}

export default async function SupplierReviewsPage({ params }: { params: { companyId: string } }) {
  const { companyId } = params;

  let payload: SupplierReviewsPayload | null = null;
  let reviews: ApiReview[] = [];
  let error: string | null = null;

  try {
    payload = await api.listSupplierReviews(companyId);
    reviews = payload.reviews;
  } catch (err) {
    console.error("Failed to load supplier reviews", err);
    error = (err as Error)?.message || "Unable to load reviews";
  }

  const average = payload?.avg ?? averageRating(reviews);

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-20 pt-16 lg:px-8 lg:pt-20">
      <header className="flex flex-col justify-between gap-6 rounded-3xl border border-border/30 bg-card/80 px-8 py-10 shadow-lg backdrop-blur-xl sm:flex-row sm:items-end">
        <div className="space-y-4">
          <Badge className="w-fit">Supplier performance</Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Reviews for {companyId}</h1>
            <p className="text-base text-muted-foreground">
              Average rating {reviews.length ? average.toFixed(2) : "–"} from {reviews.length} review
              {reviews.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/">← Back to overview</Link>
        </Button>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-600 shadow-sm">
          {error}
        </div>
      )}

      <Card className="rounded-3xl border border-border/30 bg-card/85 shadow-lg backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-4">
          <CardTitle className="text-2xl font-semibold">Recent feedback</CardTitle>
          <CardDescription>
            Once buyers submit post-delivery feedback it will be displayed here, including ratings and comments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length ? (
            <ul className="space-y-4">
              {reviews.map((review, index) => (
                <li
                  key={`${review.orderId}-${index}`}
                  className="rounded-2xl border border-border/40 bg-white/80 px-5 py-4 shadow-md backdrop-blur"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="rounded-full bg-accent-subtle px-3 py-1 text-sm font-semibold text-accent">
                      {review.rating.toFixed(1)}
                    </span>
                    <span className="font-medium text-foreground">Order {review.orderId || "—"}</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-base text-foreground">{review.comment || "No comment provided."}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/40 bg-white/70 px-6 py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground">No reviews yet</h3>
              <p className="mt-2 text-sm">Once buyers submit post-delivery feedback it will be displayed here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
