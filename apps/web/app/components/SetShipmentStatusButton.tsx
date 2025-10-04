"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";

type Props = {
  shipmentId: string;
  status: string;
  label: string;
  variant?: "primary" | "ghost";
};

export default function SetShipmentStatusButton({
  shipmentId,
  status,
  label,
  variant = "ghost",
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="action-button-stack">
      <button
        type="button"
        className={variant === "primary" ? "button-primary" : "button-secondary"}
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await api.setShipmentStatus(shipmentId, status);
              router.refresh();
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message || "Failed to update status");
            }
          });
        }}
      >
        {isPending ? "Updating..." : label}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
