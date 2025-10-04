"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";

export default function CreateContractForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [terms, setTerms] = useState("Payment due upon delivery. Incoterms FOB.");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createContract(orderId, terms);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to create contract");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__field">
        <label className="form__label" htmlFor={`terms-${orderId}`}>
          Contract terms
        </label>
        <textarea
          id={`terms-${orderId}`}
          className="textarea"
          rows={4}
          value={terms}
          onChange={(event) => setTerms(event.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="form__footer">
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create contract"}
        </button>
        {error && <span className="form-error">{error}</span>}
      </div>
    </form>
  );
}
