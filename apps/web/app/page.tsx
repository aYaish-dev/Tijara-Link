import Link from "next/link";
import NewRfqForm from "./components/NewRfqForm";

const API_BASE =
  process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

async function listRfq() {
  const res = await fetch(`${API_BASE}/rfq`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const rfqs = await listRfq();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">RFQs</h1>

      <ul className="space-y-3">
        {rfqs.map((r: any) => (
          <li key={r.id} className="border p-3 rounded">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm text-gray-600">
              Status: {r.status} — Dest: {r.destinationCountry}
            </div>
          </li>
        ))}
        {rfqs.length === 0 && (
          <li className="text-sm text-gray-500">No RFQs yet.</li>
        )}
      </ul>

      {/* الفورم التفاعلي كمكوّن Client */}
      <NewRfqForm />

      <div className="text-sm text-gray-500">
        API: <Link href="http://localhost:3001/health">/health</Link>
      </div>
    </main>
  );
}
