import Link from "next/link";

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...(init || {}) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default async function RfqPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const rfq = await fetchJSON(`http://localhost:3001/rfq`).then((arr) =>
    (arr as any[]).find((r) => r.id === id)
  );
  if (!rfq) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">RFQ not found</h1>
      </main>
    );
  }

  const quotes = await fetchJSON(`http://localhost:3001/quotes/rfq/${id}`).catch(() => []);

  return (
    <main className="p-6 space-y-4">
      <Link href="/" className="underline text-sm">← Back</Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{rfq.title}</h1>
        <p className="text-sm text-gray-600">
          Status: {rfq.status} — Dest: {rfq.destinationCountry}
        </p>
        <p className="text-xs text-gray-500">{new Date(rfq.createdAt).toLocaleString()} • {rfq.id}</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Quotes</h2>
        {quotes.length === 0 && <p className="text-sm text-gray-600">No quotes yet.</p>}
        <ul className="space-y-3">
          {quotes.map((q: any) => (
            <li key={q.id} className="border rounded p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{q.currency} {(q.pricePerUnitMinor/100).toFixed(2)}</span>
                <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{q.status}</span>
              </div>
              <p className="text-sm text-gray-600">
                MOQ: {q.moq ?? "-"} • Lead: {q.leadTimeDays ?? "-"} days
              </p>
              <p className="text-xs text-gray-500">{q.id}</p>

              <div className="mt-3 flex gap-8">
                {/* زر قبول العرض */}
                <form action={`/rfq/${id}?accept=${q.id}`} method="post"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await fetch(`http://localhost:3001/quotes/${q.id}/accept`, { method: "POST" });
                        location.reload();
                      }}>
                  <button type="submit" className="px-3 py-1.5 rounded border">
                    Accept
                  </button>
                </form>

                {/* زر إنشاء الطلب من العرض */}
                <form action={`/rfq/${id}?order=${q.id}`} method="post"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        // بسيط: المجموع = pricePerUnitMinor
                        await fetch(`http://localhost:3001/orders`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            quoteId: q.id,
                            totalMinor: q.pricePerUnitMinor,
                            totalCurrency: q.currency || "USD",
                          }),
                        }).then(async (r) => {
                          const data = await r.json();
                          if (data?.id) location.href = `/orders/${data.id}`;
                        });
                      }}>
                  <button type="submit" className="px-3 py-1.5 rounded border">
                    Create Order
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
