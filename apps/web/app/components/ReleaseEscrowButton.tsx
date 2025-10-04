"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

export default function ReleaseEscrowButton({ orderId }: { orderId: string }) {
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
              await api.releaseEscrow(orderId);
              router.refresh();
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message || "Failed to release escrow");
            }
          });
        }}
      >
        {isPending ? "Releasing..." : "Release Escrow"}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
