"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

export default function AcceptQuoteButton({
  quoteId,
}: {
  quoteId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="action-button-stack">
      <button
        type="button"
        className="button-secondary"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await api.acceptQuote(quoteId);
              router.refresh();
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message || "Failed to accept quote");
            }
          });
        }}
      >
        {isPending ? "Accepting..." : "Accept Quote"}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
