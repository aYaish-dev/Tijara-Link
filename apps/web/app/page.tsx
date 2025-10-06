// apps/web/app/page.tsx
import Link from "next/link";
import { api, API_BASE, type ApiRfq } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let rfqs: ApiRfq[] = [];
  try {
    rfqs = await api.listRfq();
  } catch (err) {
    console.error("Failed to load RFQs", err);
    rfqs = [];
  }

  const totalRfqs = rfqs.length;
  const activeRfqs = rfqs.filter((r) =>
    String(r.status || "").toLowerCase().match(/pending|review|submitted|active|accepted/)
  ).length;
  const fulfilledRfqs = rfqs.filter((r) =>
    String(r.status || "").toLowerCase().match(/closed|awarded|completed|delivered/)
  ).length;

  const stats = [
    { label: "Open RFQs", value: activeRfqs.toString() },
    { label: "Fulfilled", value: fulfilledRfqs.toString() },
    { label: "Total Requests", value: totalRfqs.toString() },
    {
      label: "API Endpoint",
      value: (
        <Link href={`${API_BASE}/rfq`} target="_blank" rel="noreferrer" className="font-semibold text-accent">
          /rfq
        </Link>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-500/10 via-slate-900 to-indigo-600/10" />
        <div className="absolute -right-24 top-24 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 -z-10 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-16 pt-20 lg:flex-row lg:items-center lg:gap-24 lg:pt-28">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-4 rounded-full border border-slate-800/60 bg-slate-900/80 px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] text-slate-300">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">🐉</span>
              TijaraLink
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Dragon-powered procurement for modern trade alliances.
            </h1>
            <p className="text-lg leading-relaxed text-slate-300 lg:text-xl">
              Bring buyers and suppliers together inside a trust-first marketplace. TijaraLink orchestrates sourcing,
              negotiation, and order fulfillment so teams can move from intent to delivery with confidence.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-emerald-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">For Buyers</p>
                <p className="mt-2 text-sm text-slate-300">Access verified suppliers and orchestrate compliant sourcing.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/buyers/login"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                  >
                    Buyer Login
                  </Link>
                  <Link
                    href="/buyers/register"
                    className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-emerald-100"
                  >
                    Create Buyer Account
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-amber-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">For Suppliers</p>
                <p className="mt-2 text-sm text-slate-300">Showcase capabilities and secure recurring export demand.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/suppliers/login"
                    className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-300"
                  >
                    Supplier Login
                  </Link>
                  <Link
                    href="/suppliers/register"
                    className="inline-flex items-center justify-center rounded-full border border-amber-300/60 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-200 hover:text-amber-100"
                  >
                    Join as Supplier
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Marketplace Pulse</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/60 p-5 shadow-inner shadow-slate-900">
                  <div className="text-3xl font-bold text-white">{activeRfqs}</div>
                  <p className="mt-2 text-sm text-slate-400">Active RFQs</p>
                </div>
                <div className="rounded-2xl bg-slate-950/60 p-5 shadow-inner shadow-slate-900">
                  <div className="text-3xl font-bold text-white">{fulfilledRfqs}</div>
                  <p className="mt-2 text-sm text-slate-400">Fulfilled Requests</p>
                </div>
                <div className="rounded-2xl bg-slate-950/60 p-5 shadow-inner shadow-slate-900">
                  <div className="text-3xl font-bold text-white">{totalRfqs}</div>
                  <p className="mt-2 text-sm text-slate-400">Total RFQs</p>
                </div>
              </div>
              <div className="mt-8 space-y-3 text-sm text-slate-300">
                <p>Monitor new activity, convert requests into orders, and audit compliance across your trade lanes.</p>
                <Link
                  href={`${API_BASE}/health`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-300 transition hover:text-emerald-200"
                >
                  Check API health →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-t border-slate-800 bg-slate-950/80 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Buyer Advantage</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Strategic sourcing without the friction.</h2>
              </div>
              <p className="text-base leading-relaxed text-emerald-50/80">
                Launch RFQs with structured templates, evaluate responses with collaborative scorecards, and convert to
                compliant orders in a few clicks.
              </p>
              <ul className="space-y-4 text-sm text-emerald-50/90">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">✓</span>
                  <span>Curated supplier marketplace with region-specific compliance checks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">✓</span>
                  <span>Real-time visibility on shipment and escrow milestones.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">✓</span>
                  <span>Negotiation rooms that centralize messaging, documents, and approval trails.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">Supplier Advantage</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Grow export revenue with predictable demand.</h2>
              </div>
              <p className="text-base leading-relaxed text-amber-50/80">
                Showcase certifications, automate document submission, and receive escrow-backed commitments from
                international buyers.
              </p>
              <ul className="space-y-4 text-sm text-amber-50/90">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">★</span>
                  <span>Prominent placement for verified capabilities and sustainable practices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">★</span>
                  <span>Integrated logistics workflows from offer acceptance to customs clearance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-lg">★</span>
                  <span>Analytics that highlight demand trends and recurring opportunities.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950/90 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Integrations</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Build automations on top of the TijaraLink API.</h2>
            <p className="text-base leading-relaxed text-slate-300">
              Use REST hooks to synchronize RFQs, manage contract lifecycles, and push shipping updates into your ERP.
              Our documentation includes prebuilt Postman collections and sandbox credentials.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`${API_BASE}/docs`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Explore API Docs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Talk to Solutions Team
              </Link>
            </div>
          </div>
          <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <div className="space-y-4 text-sm text-slate-300">
              <p className="font-semibold text-white">API Highlights</p>
              <p>• Webhook-ready RFQ events</p>
              <p>• OAuth2 service accounts</p>
              <p>• Sandbox data resets nightly</p>
              <p>• SLA-backed uptime commitments</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">🐉</span>
            <div>
              <p className="text-lg font-semibold text-white">TijaraLink</p>
              <p className="text-sm text-slate-400">Supply chain partnerships without compromise.</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link
              href={`${API_BASE}/docs`}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              API Docs
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
