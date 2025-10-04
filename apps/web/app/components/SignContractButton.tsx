"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";

type Props = {
  contractId: string;
  role: "buyer" | "supplier";
};

export default function SignContractButton({ contractId, role }: Props) {
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
              await api.signContract(contractId, role);
              router.refresh();
            } catch (err) {
              console.error(err);
              setError((err as Error)?.message || "Failed to sign contract");
            }
          });
        }}
      >
        {isPending ? "Signing..." : `Sign as ${role}`}
      </button>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
