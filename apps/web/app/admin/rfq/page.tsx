"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useRequireRole } from "../../hooks/useRequireRole";
import { api, type ApiQuote, type ApiRfq } from "@/lib/api";

function formatDate(input?: string | null) {
  if (!input) return "—";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toStatusKey(value?: string | null) {
  return String(value || "").toUpperCase();
}

type QuotesMap = Record<string, ApiQuote[]>;

export default function AdminRfqPage() {
  const { canRender, isHydrated } = useRequireRole("admin", { redirectTo: "/admin/rfq" });
  const [rfqs, setRfqs] = useState<ApiRfq[]>([]);
  const [quotesMap, setQuotesMap] = useState<QuotesMap>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!canRender) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const rfqResponse = await api.listRfq();
        if (!cancelled) {
          setRfqs(rfqResponse);
        }

        const entries = await Promise.all(
          rfqResponse.map(async (rfq) => {
            try {
              const quotes = await api.listQuotesByRfq(rfq.id);
              return [rfq.id, quotes] as const;
            } catch (err) {
              console.error("Failed to load quotes for", rfq.id, err);
              return [rfq.id, []] as const;
            }
          }),
        );

        if (!cancelled) {
          setQuotesMap(Object.fromEntries(entries));
        }
      } catch (err) {
        console.error("Failed to load RFQs", err);
        if (!cancelled) {
          setError((err as Error)?.message || "Unable to load RFQs");
          setRfqs([]);
          setQuotesMap({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [canRender]);

  if (!isHydrated || !canRender) {
    return (
      <main className="detail-page">
        <header className="detail-header">
          <div>
            <p className="eyebrow">RFQ administration</p>
            <h1>RFQs</h1>
          </div>
        </header>
        <section className="card">
          <h2>Verifying access…</h2>
          <p>Please wait while we confirm your permissions.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">RFQ administration</p>
          <h1>RFQs</h1>
        </div>
        <Link className="button-secondary" href="/admin">
          ← Back to admin
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Live RFQs</h2>
            <p className="section-subtitle">All demand captured from buyers. Open any request to inspect quotes.</p>
          </div>
          <span className="badge-inline">{rfqs.length} total</span>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <h3>Loading RFQs…</h3>
            <p>Retrieving the latest sourcing pipeline.</p>
          </div>
        ) : rfqs.length ? (
          <div className="table-wrapper">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Destination</th>
                  <th>Quotes</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => {
                  const quotes = quotesMap[rfq.id] || [];
                  const accepted = quotes.filter((quote) => /ACCEPTED/.test(toStatusKey(quote.status))).length;
                  return (
                    <tr key={rfq.id}>
                      <td className="mono">{rfq.id}</td>
                      <td>{rfq.title}</td>
                      <td>{rfq.status || "OPEN"}</td>
                      <td>{rfq.destinationCountry || "—"}</td>
                      <td>
                        {accepted}/{quotes.length}
                      </td>
                      <td>{formatDate(rfq.createdAt)}</td>
                      <td>
                        <Link className="link-muted" href={`/rfq/${rfq.id}`}>
                          View quotes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No RFQs registered yet</h3>
            <p>Publish a request from the landing page to begin receiving supplier responses.</p>
          </div>
        )}
      </section>
    </main>
  );
}

