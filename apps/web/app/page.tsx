import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { api, API_BASE, type ApiRfq } from "@/lib/api";
import NewRfqForm from "./components/NewRfqForm";

export const dynamic = "force-dynamic";

function statusTone(status?: string | null) {
  const normalized = String(status ?? "pending").toLowerCase();
  if (/(approved|accepted|active|awarded)/.test(normalized)) {
    return "bg-emerald-500/15 text-emerald-600 ring-1 ring-inset ring-emerald-500/30";
  }
  if (/(closed|cancelled|canceled|rejected|expired)/.test(normalized)) {
    return "bg-rose-500/15 text-rose-600 ring-1 ring-inset ring-rose-500/30";
  }
  if (/(draft)/.test(normalized)) {
    return "bg-muted/15 text-muted-foreground ring-1 ring-inset ring-muted/30";
  }
  return "bg-amber-500/15 text-amber-600 ring-1 ring-inset ring-amber-500/30";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

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
    <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-16 lg:gap-16 lg:px-8 lg:pt-20">
      <section className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/80 p-8 shadow-lg backdrop-blur-xl sm:p-12">
        <div aria-hidden className="absolute inset-0 bg-body-radial opacity-60" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid max-w-2xl gap-6">
            <Badge className="w-fit">TijaraLink Platform</Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Procurement visibility and supplier collaboration in one elegant hub.
            </h1>
            <p className="text-lg text-muted-foreground">
              Monitor every request-for-quote, engage trusted partners, and move from sourcing to awarding with total confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <a href="#create-rfq">Start a New RFQ</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={`${API_BASE}/health`} target="_blank" rel="noreferrer">
                  API Health Endpoint
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded-full border border-accent/40 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-md backdrop-blur">
            <span aria-hidden className="mr-2">
              🔒
            </span>
            Secure workflows with escrow-ready orders
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/30 bg-card/70 p-6 shadow-md backdrop-blur"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              {stat.label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl border border-border/30 bg-card/85 shadow-lg backdrop-blur-xl">
          <CardHeader className="gap-3 pb-4">
            <Badge className="w-fit bg-accent-subtle text-accent">Live Pipeline</Badge>
            <CardTitle className="text-3xl font-semibold">Active Requests for Quote</CardTitle>
            <CardDescription className="text-base">
              Track statuses, due dates, and destinations at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {rfqs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-transparent">
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfqs.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-foreground">{r.title}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                              statusTone(r.status)
                            )}
                          >
                            {r.status || "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.destinationCountry || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/40 bg-white/70 px-6 py-12 text-center text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground">No RFQs yet</h3>
                <p className="mt-2 text-sm">Create your first request to start collaborating with suppliers.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="create-rfq" className="rounded-3xl border border-border/30 bg-card/85 shadow-lg backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="text-2xl font-semibold">Launch a new RFQ</CardTitle>
            <CardDescription className="text-base">
              Share your sourcing requirements with verified suppliers and receive quotes without friction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <NewRfqForm />
            <p className="text-sm text-muted-foreground">
              Need to integrate programmatically? Explore the{" "}
              <Link href={`${API_BASE}/docs`} className="font-semibold text-accent" target="_blank" rel="noreferrer">
                developer docs
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
