import RfqPageClient from "./RfqPageClient";

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

  return <RfqPageClient rfq={rfq} quotes={quotes} />;
}
