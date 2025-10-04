"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function QuoteClientPage({ params }: { params: { id: string } }) {
  const quoteId = params.id;
  const [quote, setQuote] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      // ما عندنا endpoint GET /quotes/:id في الباك، فنعتمد على معرفة الـ quote من قائمة RFQ أو نخزن من الـ URL
      // كحل سريع: ما بنجيب تفاصيل إضافية، بنعرض الـ id فقط.
      setQuote({ id: quoteId });
    } catch (e: any) { /* ignore */ }
  }

  useEffect(() => { load(); }, []);

  async function accept() {
    setError(null);
    try {
      await api.acceptQuote(quoteId);
      alert("Quote accepted");
    } catch (e: any) {
      setError(e?.message || "accept failed");
    }
  }

  async function createOrder() {
    setCreating(true);
    setError(null);
    try {
      // totalMinor افتراضياً 95000 زي الأمثلة — غيّر حسب حاجتك
      const created = await api.createOrder({ quoteId, totalMinor: 95000, totalCurrency: "USD" });
      setOrder(created);
    } catch (e: any) {
      setError(e?.message || "order failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Link href="/" className="text-sm underline">&larr; Home</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Quote #{quoteId}</h1>

      {error && <div className="p-3 mb-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="flex gap-2">
        <button onClick={accept} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Accept Quote</button>
        <button onClick={createOrder} disabled={creating} className="px-3 py-1.5 rounded bg-black text-white text-sm">
          {creating ? "Creating..." : "Create Order"}
        </button>
      </div>

      {order && (
        <div className="mt-4 border rounded-lg p-4">
          <div className="font-semibold mb-1">Order Created</div>
          <div className="text-sm text-gray-600">ID: {order.id}</div>
          <div className="text-sm text-gray-600">Total: {order.totalCurrency} {(order.totalMinor/100).toFixed(2)}</div>
          <Link href={`/order/${order.id}`} className="inline-block mt-3 px-3 py-1.5 rounded bg-green-600 text-white text-sm">
            Open Order
          </Link>
        </div>
      )}
    </main>
  );
}
