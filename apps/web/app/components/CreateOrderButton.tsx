"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

type Props = {
  quoteId: string;
  totalMinor?: number;
  currency?: string | null;
};

export default function CreateOrderButton({ quoteId, totalMinor, currency }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="action-button-stack">
      <button
        type="button"
        className="button-primary"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const order = await api.createOrder({
                quoteId,
                totalMinor,
                totalCurrency: currency ?? "USD",
              });
              if (order?.id) {
                router.push(`/orders/${order.id}`);
              } else {
                router.refresh();
              }
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message || "Failed to create order");
            }
          });
        }}
      >
        {isPending ? "Creating order..." : "Create Order"}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
