"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Shipment = {
  id: string;
  mode: string;
  tracking: string;
  status: string;
};

type Escrow = {
  currency: string;
  heldMinor: number;
  released: boolean;
};

type Contract = {
  id: string;
  hash: string;
  buyerSignedAt?: string | null;
  supplierSignedAt?: string | null;
};

type Order = {
  id: string;
  status: string;
  totalCurrency: string;
  totalMinor: number;
  createdAt: string;
  escrow?: Escrow | null;
  shipments?: Shipment[];
  contract?: Contract | null;
};

export default function OrderPageClient({ order }: { order: Order }) {
  const router = useRouter();
  const price = (order.totalMinor ?? 0) / 100;

  return (
    <main className="p-6 space-y-4">
      <Link href="/" className="underline text-sm">
        ← Back
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Order</h1>
        <p className="text-sm text-gray-600">
          Status: {order.status} — Total: {order.totalCurrency} {price.toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleString()} • {order.id}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Escrow</h2>
        {order.escrow ? (
          <div className="border rounded p-3 text-sm">
            <p>
              Held: {order.escrow.currency} {(order.escrow.heldMinor / 100).toFixed(2)} —
              Released: {order.escrow.released ? "Yes" : "No"}
            </p>
            {!order.escrow.released && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await fetch(`http://localhost:3001/orders/${order.id}/escrow/release`, {
                    method: "POST",
                  });
                  router.refresh();
                }}
              >
                <button type="submit" className="mt-2 px-3 py-1.5 rounded border">
                  Release
                </button>
              </form>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No escrow.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Shipments</h2>
        <div className="border rounded p-3 text-sm">
          <form
            className="flex gap-2 flex-wrap items-center"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const tracking = (form.elements.namedItem("tracking") as HTMLInputElement).value ||
                "TRK-CLIENT";
              const mode = (form.elements.namedItem("mode") as HTMLSelectElement).value || "SEA";
              await fetch(`http://localhost:3001/orders/${order.id}/shipments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode, trackingNumber: tracking }),
              });
              router.refresh();
            }}
          >
            <input name="tracking" placeholder="Tracking Number" className="border px-2 py-1 rounded" />
            <select name="mode" className="border px-2 py-1 rounded">
              <option>SEA</option>
              <option>AIR</option>
              <option>ROAD</option>
            </select>
            <button type="submit" className="px-3 py-1.5 rounded border">
              Add Shipment
            </button>
          </form>
        </div>

        <ul className="space-y-3">
          {(order.shipments || []).map((s) => (
            <li key={s.id} className="border rounded p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.mode}</span>
                <span>#{s.tracking}</span>
                <span className="text-xs bg-gray-200 rounded px-2 py-0.5">{s.status}</span>
              </div>
              <p className="text-xs text-gray-500">{s.id}</p>

              <div className="mt-2 flex gap-2">
                <button
                  className="px-2 py-1 rounded border"
                  onClick={async () => {
                    await fetch(`http://localhost:3001/shipments/${s.id}/status`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "AT_CUSTOMS" }),
                    });
                    router.refresh();
                  }}
                >
                  Mark AT_CUSTOMS
                </button>

                <button
                  className="px-2 py-1 rounded border"
                  onClick={async () => {
                    const payload = {
                      data: { hsCode: "7208.38", docs: ["invoice.pdf"] },
                      status: "SUBMITTED",
                    };
                    await fetch(`http://localhost:3001/shipments/${s.id}/customs`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    alert("Customs submitted (check API logs).");
                  }}
                >
                  Submit Customs
                </button>

                <button
                  className="px-2 py-1 rounded border"
                  onClick={async () => {
                    await fetch(`http://localhost:3001/shipments/${s.id}/status`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "DELIVERED" }),
                    });
                    router.refresh();
                  }}
                >
                  Mark DELIVERED
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contract</h2>
        <div className="border rounded p-3 text-sm">
          <button
            className="px-3 py-1.5 rounded border"
            onClick={async () => {
              const r = await fetch(`http://localhost:3001/contracts/order/${order.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ terms: "Basic TijaraLink contract terms v1" }),
              });
              if (r.ok) router.refresh();
            }}
          >
            Create Contract
          </button>
        </div>

        {order.contract && (
          <div className="border rounded p-3 text-sm">
            <p>Hash: {order.contract.hash}</p>
            <p>
              Buyer: {order.contract.buyerSignedAt ? "Signed" : "Pending"} • Supplier: {" "}
              {order.contract.supplierSignedAt ? "Signed" : "Pending"}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                className="px-2 py-1 rounded border"
                onClick={async () => {
                  await fetch(`http://localhost:3001/contracts/${order.contract?.id}/sign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "buyer" }),
                  });
                  router.refresh();
                }}
              >
                Sign (Buyer)
              </button>
              <button
                className="px-2 py-1 rounded border"
                onClick={async () => {
                  await fetch(`http://localhost:3001/contracts/${order.contract?.id}/sign`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "supplier" }),
                  });
                  router.refresh();
                }}
              >
                Sign (Supplier)
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Review</h2>
        <form
          className="border rounded p-3 text-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const rating = Number((form.elements.namedItem("rating") as HTMLInputElement).value || 5);
            const comment = (form.elements.namedItem("comment") as HTMLInputElement).value || "";
            await fetch(`http://localhost:3001/orders/${order.id}/review`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ rating, comment }),
            });
            alert("Review saved.");
          }}
        >
          <input
            name="rating"
            type="number"
            min="1"
            max="5"
            defaultValue={5}
            className="border px-2 py-1 rounded mr-2"
          />
          <input
            name="comment"
            placeholder="excellent & on-time"
            className="border px-2 py-1 rounded mr-2 w-64"
          />
          <button type="submit" className="px-3 py-1.5 rounded border">
            Save
          </button>
        </form>
      </section>
    </main>
  );
}