import Link from "next/link";

import { API_BASE } from "@/lib/api";
import OrderPageClient from "./OrderPageClient";

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: "no-store", ...(init || {}) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const order = await fetchJSON(`${API_BASE}/orders/${id}`).catch(() => null);

  if (!order) {
    return (
      <main className="p-6">
        <Link href="/" className="underline text-sm">← Back</Link>
        <h1 className="text-xl font-semibold">Order not found</h1>
      </main>
    );
  }
  return <OrderPageClient order={order} />;
}
