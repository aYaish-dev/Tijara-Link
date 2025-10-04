"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api, ApiCustoms } from "@/lib/api";

type Props = {
  shipmentId: string;
  customs?: ApiCustoms | null;
};

export default function AttachCustomsForm({ shipmentId, customs }: Props) {
  const router = useRouter();
  const [hsCode, setHsCode] = useState(customs?.data?.hsCode ?? "");
  const [docs, setDocs] = useState((customs?.data?.docs || []).join(", "));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const docsList = docs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      await api.attachCustoms(shipmentId, {
        data: { hsCode: hsCode || undefined, docs: docsList },
        status: customs?.status ?? "SUBMITTED",
      });

      router.refresh();
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to submit customs");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__field">
        <label className="form__label" htmlFor={`hs-${shipmentId}`}>
          HS Code
        </label>
        <input
          id={`hs-${shipmentId}`}
          className="input"
          placeholder="7208.38"
          value={hsCode}
          onChange={(event) => setHsCode(event.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="form__field">
        <label className="form__label" htmlFor={`docs-${shipmentId}`}>
          Documents (comma separated)
        </label>
        <input
          id={`docs-${shipmentId}`}
          className="input"
          placeholder="invoice.pdf, packing-list.pdf"
          value={docs}
          onChange={(event) => setDocs(event.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="form__footer">
        <button type="submit" className="button-secondary" disabled={submitting}>
          {submitting ? "Submitting..." : customs ? "Update declaration" : "Attach customs"}
        </button>
        {error && <span className="form-error">{error}</span>}
      </div>
    </form>
  );
}
