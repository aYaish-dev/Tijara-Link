"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { API_BASE } from "@/lib/api";

export default function NewRfqForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formEl = e.currentTarget;

    try {
      const form = new FormData(formEl);
      const payload = {
        title: form.get("title"),
        details: form.get("details"),
        destinationCountry: form.get("dest") || "PS",
      };

      const res = await fetch(`${API_BASE}/rfq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Failed to create RFQ");
        return;
      }

      router.refresh();
      formEl.reset();
    } catch (error) {
      console.error("Failed to submit RFQ", error);
      alert("Something went wrong while creating the RFQ. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <div className="form__field-group">
        <div className="form__field">
          <label className="form__label" htmlFor="rfq-title">
            Project title
          </label>
          <input
            id="rfq-title"
            name="title"
            placeholder="Example: Logistics support for Q3 expansion"
            className="input"
            required
            disabled={loading}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="rfq-details">
            Overview
          </label>
          <textarea
            id="rfq-details"
            name="details"
            placeholder="Outline the scope, volumes, or any specifications suppliers should know."
            className="textarea"
            disabled={loading}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="rfq-destination">
            Destination country
          </label>
          <input
            id="rfq-destination"
            name="dest"
            placeholder="PS"
            className="input"
            defaultValue="PS"
            disabled={loading}
          />
        </div>
      </div>
      <div className="form__footer">
        <button type="submit" disabled={loading} className="button-primary">
          {loading ? "Publishing..." : "Publish RFQ"}
        </button>
        <span className="form__hint">
          Buyers are notified instantly. You can edit RFQ details anytime.
        </span>
      </div>
    </form>
  );
}
