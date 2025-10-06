"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

type RfqOption = {
  id: string;
  title: string;
  destinationCountry?: string | null;
};

type Props = {
  rfqs: RfqOption[];
};

type FormStatus = {
  error: string | null;
  success: string | null;
};

export default function QuoteSubmissionForm({ rfqs }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>({ error: null, success: null });
  const [isPending, startTransition] = useTransition();
  const [selectedRfq, setSelectedRfq] = useState<string>(rfqs[0]?.id ?? "");

  const rfqOptions = useMemo(() => rfqs.map((rfq) => ({
    value: rfq.id,
    label: `${rfq.title}${rfq.destinationCountry ? ` → ${rfq.destinationCountry}` : ""}`,
  })), [rfqs]);

  const hasRfqs = rfqOptions.length > 0;

  useEffect(() => {
    setSelectedRfq(rfqs[0]?.id ?? "");
  }, [rfqs]);

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!hasRfqs || isPending) return;

        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const rfqId = (formData.get("rfqId") || "").toString();
          const currency = (formData.get("currency") || "USD").toString().toUpperCase();
          const pricePerUnitMinor = Number(formData.get("pricePerUnitMinor") || 0);
          const moqRaw = formData.get("moq");
          const leadTimeRaw = formData.get("leadTimeDays");

          setStatus({ error: null, success: null });

          if (!rfqId) {
            setStatus({ error: "Select an RFQ before submitting a quote.", success: null });
            return;
          }

          if (!Number.isFinite(pricePerUnitMinor) || pricePerUnitMinor <= 0) {
            setStatus({ error: "Enter a valid unit price in minor units.", success: null });
            return;
          }

          try {
            await api.createQuote({
              rfqId,
              currency,
              pricePerUnitMinor,
              moq: moqRaw ? Number(moqRaw) : undefined,
              leadTimeDays: leadTimeRaw ? Number(leadTimeRaw) : undefined,
            });
            setStatus({ error: null, success: "Quote submitted successfully." });
            event.currentTarget.reset();
            setSelectedRfq(rfqOptions[0]?.value ?? "");
            router.refresh();
          } catch (error) {
            console.error(error);
            setStatus({
              error: (error as Error)?.message || "Failed to submit quote.",
              success: null,
            });
          }
        });
      }}
    >
      <div className="form__field">
        <label className="form__label" htmlFor="rfqId">
          RFQ
        </label>
        <select
          id="rfqId"
          name="rfqId"
          className="select"
          value={selectedRfq}
          onChange={(event) => setSelectedRfq(event.target.value)}
          disabled={!hasRfqs || isPending}
          required
        >
          {hasRfqs ? (
            rfqOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            <option value="">No open RFQs</option>
          )}
        </select>
      </div>

      <div className="form__field-group">
        <div className="form__field">
          <label className="form__label" htmlFor="currency">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            className="input"
            defaultValue="USD"
            placeholder="USD"
            maxLength={3}
            disabled={!hasRfqs || isPending}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="pricePerUnitMinor">
            Price per unit (minor)
          </label>
          <input
            id="pricePerUnitMinor"
            name="pricePerUnitMinor"
            type="number"
            min={1}
            step={1}
            className="input"
            placeholder="95000"
            disabled={!hasRfqs || isPending}
            required
          />
        </div>
      </div>

      <div className="form__field-group">
        <div className="form__field">
          <label className="form__label" htmlFor="moq">
            Minimum order quantity
          </label>
          <input
            id="moq"
            name="moq"
            type="number"
            min={1}
            step={1}
            className="input"
            placeholder="5"
            disabled={!hasRfqs || isPending}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="leadTimeDays">
            Lead time (days)
          </label>
          <input
            id="leadTimeDays"
            name="leadTimeDays"
            type="number"
            min={0}
            step={1}
            className="input"
            placeholder="10"
            disabled={!hasRfqs || isPending}
          />
        </div>
      </div>

      <div className="form__footer">
        <button className="button-primary" type="submit" disabled={!hasRfqs || isPending}>
          {isPending ? "Submitting..." : "Submit quote"}
        </button>
        <span className="form__hint">All amounts should use the API minor-unit format.</span>
      </div>

      {status.error && <p className="form-error">{status.error}</p>}
      {status.success && <p className="form-success">{status.success}</p>}
    </form>
  );
}
