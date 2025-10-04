"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

type Props = {
  orderId: string;
};

export default function CreateShipmentForm({ orderId }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState("SEA");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createShipment(orderId, {
        mode,
        trackingNumber: trackingNumber || undefined,
      });
      setTrackingNumber("");
      setMode("SEA");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError((err as Error)?.message || "Failed to create shipment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form form--inline" onSubmit={handleSubmit}>
      <div className="form__field">
        <label className="form__label" htmlFor={`tracking-${orderId}`}>
          Tracking number
        </label>
        <input
          id={`tracking-${orderId}`}
          name="tracking"
          className="input"
          placeholder="TRK-001"
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          disabled={submitting}
        />
      </div>
      <div className="form__field">
        <label className="form__label" htmlFor={`mode-${orderId}`}>
          Mode
        </label>
        <select
          id={`mode-${orderId}`}
          className="input"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
          disabled={submitting}
        >
          <option value="SEA">Sea</option>
          <option value="AIR">Air</option>
          <option value="ROAD">Road</option>
          <option value="RAIL">Rail</option>
        </select>
      </div>
      <div className="form__footer" style={{ marginTop: "auto" }}>
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create shipment"}
        </button>
        {error && <span className="form-error">{error}</span>}
      </div>
    </form>
  );
}
