"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";
import type { ApiReview } from "../../lib/api";

type Props = {
  orderId: string;
  review?: ApiReview | null;
};

export default function ReviewForm({ orderId, review }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.text ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      await api.upsertReview(orderId, rating, comment);
      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__field">
        <label className="form__label" htmlFor={`rating-${orderId}`}>
          Rating
        </label>
        <input
          id={`rating-${orderId}`}
          type="number"
          min={1}
          max={5}
          className="input"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          disabled={submitting}
        />
      </div>
      <div className="form__field">
        <label className="form__label" htmlFor={`comment-${orderId}`}>
          Comment
        </label>
        <textarea
          id={`comment-${orderId}`}
          className="textarea"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="form__footer">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save review"}
        </button>
        {saved && <span className="form-success">Saved</span>}
        {error && <span className="form-error">{error}</span>}
      </div>
    </form>
  );
}
