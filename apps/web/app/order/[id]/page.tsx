"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function OrderPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [order, setOrder] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function reload() {
    setErr(null);
    try {
      const o = await api.getOrder(id);
      setOrder(o);
    } catch (e: any) {
      setErr(e?.message || "load failed");
    }
  }

  useEffect(() => { reload(); }, []);

  async function releaseEscrow() {
    setMsg(null); setErr(null);
    try {
      const r = await api.releaseEscrow(id);
      setMsg("Escrow released");
      await reload();
    } catch (e: any) { setErr(e?.message || "escrow failed"); }
  }

  async function createShipment() {
    setMsg(null); setErr(null);
    try {
      await api.createShipment(id, { mode: "SEA", trackingNumber: "TRK-WEB" });
      setMsg("Shipment created");
      await reload();
    } catch (e: any) { setErr(e?.message || "shipment failed"); }
  }

  async function signBoth() {
    try {
      const c = await api.createContract(id, "Basic TijaraLink contract terms v1");
      await api.signContract(c.id, "buyer");
      await api.signContract(c.id, "supplier");
      setMsg("Contract signed by both");
      await reload();
    } catch (e: any) { setErr(e?.message || "contract failed"); }
  }

  async function deliverFirstShipment() {
    try {
      const first = order?.shipments?.[0];
      if (!first) throw new Error("no shipment");
      await api.setShipmentStatus(first.id, "AT_CUSTOMS");
      const decl = await api.createCustoms(first.id, { data: { hsCode: "7208.38", docs: ["invoice.pdf"] }, status: "SUBMITTED" });
      await api.updateCustomsStatus(decl.id, "CLEARED");
      await api.setShipmentStatus(first.id, "DELIVERED");
      setMsg("Shipment delivered");
      await reload();
    } catch (e: any) { setErr(e?.message || "deliver failed"); }
  }

  async function upsertReview() {
    try {
      await api.upsertReview(id, 5, "excellent & on-time");
      setMsg("Review saved");
    } catch (e: any) { setErr(e?.message || "review failed"); }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link href="/" className="text-sm underline">&larr; Home</Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">Order #{id}</h1>

      {err && <div className="p-3 mb-3 rounded bg-red-50 text-red-700 text-sm">{err}</div>}
      {msg && <div className="p-3 mb-3 rounded bg-green-50 text-green-700 text-sm">{msg}</div>}

      {order ? (
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="font-semibold">Summary</div>
            <div className="text-sm text-gray-600">Total: {order.totalCurrency} {(order.totalMinor/100).toFixed(2)}</div>
            <div className="text-sm text-gray-600">Status: {order.status}</div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-2">Actions</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={releaseEscrow} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm">Release Escrow</button>
              <button onClick={createShipment} className="px-3 py-1.5 rounded bg-black text-white text-sm">Create Shipment</button>
              <button onClick={deliverFirstShipment} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm">Deliver Shipment</button>
              <button onClick={signBoth} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm">Sign Contract</button>
              <button onClick={upsertReview} className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm">Leave Review</button>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="font-semibold">Shipments</div>
            <ul className="list-disc ml-5 text-sm">
              {order.shipments?.map((s: any) => (
                <li key={s.id}>{s.tracking} — {s.mode} — {s.status}</li>
              ))}
              {(!order.shipments || order.shipments.length === 0) && <li className="text-gray-500">No shipments</li>}
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <div className="font-semibold">Contract</div>
            {order.contract
              ? <div className="text-sm text-gray-600">Buyer: {order.contract.buyerSignedAt || "-"} — Supplier: {order.contract.supplierSignedAt || "-"}</div>
              : <div className="text-sm text-gray-600">No contract</div>}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Loading...</div>
      )}
    </main>
  );
}
