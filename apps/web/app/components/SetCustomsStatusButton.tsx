"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

type Props = {
  customsId: string;
  status: string;
  label: string;
};

export default function SetCustomsStatusButton({ customsId, status, label }: Props) {
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
              await api.setCustomsStatus(customsId, status);
              router.refresh();
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message || "Failed to update customs");
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
