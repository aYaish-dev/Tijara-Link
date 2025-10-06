"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useRequireRole } from "../../hooks/useRequireRole";
import { api, type ApiCustoms, type ApiOrder, type ApiShipment } from "@/lib/api";
import SetShipmentStatusButton from "@/app/components/SetShipmentStatusButton";
import AttachCustomsForm from "@/app/components/AttachCustomsForm";
import SetCustomsStatusButton from "@/app/components/SetCustomsStatusButton";

function shipmentStatusBadge(status?: string | null) {
  const normalized = String(status || "BOOKED").toLowerCase();
  if (/(delivered|cleared)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(customs|hold|rail|road|sea|air)/.test(normalized)) return "status-pill status-pill--pending";
  return "status-pill status-pill--draft";
}

function normaliseCustoms(customs?: ApiCustoms[] | null): ApiCustoms | null {
  if (!customs?.length) return null;
  return customs[0] ?? null;
}

export default function AdminShipmentsPage() {
  const { canRender, isHydrated } = useRequireRole("admin", { redirectTo: "/admin/shipments" });
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!canRender) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.listOrders();
        if (!cancelled) {
          setOrders(response);
        }
      } catch (err) {
        console.error("Failed to list orders for shipments", err);
        if (!cancelled) {
          setOrders([]);
          setError((err as Error)?.message || "Unable to load shipments");
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
            <p className="eyebrow">Logistics oversight</p>
            <h1>Shipments</h1>
          </div>
        </header>
        <section className="card">
          <h2>Verifying access…</h2>
          <p>Please wait while we confirm your permissions.</p>
        </section>
      </main>
    );
  }

  const shipments: ApiShipment[] = orders.flatMap((order) => order.shipments);

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Logistics oversight</p>
          <h1>Shipments</h1>
        </div>
        <Link className="button-secondary" href="/admin">
          ← Back to admin
        </Link>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Active consignments</h2>
            <p className="section-subtitle">Update movement status and manage customs declarations.</p>
          </div>
          <span className="badge-inline">{shipments.length} shipments</span>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <h3>Loading shipments…</h3>
            <p>Checking manifests and latest tracking updates.</p>
          </div>
        ) : shipments.length ? (
          <ul className="list-stack">
            {shipments.map((shipment) => {
              const customs = normaliseCustoms(shipment.customs);
              const orderHref = shipment.orderId ? `/orders/${shipment.orderId}` : "/orders";
              return (
                <li key={shipment.id} className="shipment-card">
                  <div className="shipment-card__header">
                    <div>
                      <p className="eyebrow">Shipment #{shipment.id}</p>
                      <h3>{shipment.mode || "Mode not set"}</h3>
                    </div>
                    <span className={shipmentStatusBadge(shipment.status)}>{shipment.status || "BOOKED"}</span>
                  </div>
                  <p className="section-subtitle">Order {shipment.orderId || "—"} • Tracking {shipment.tracking || "—"}</p>

                  <div className="stack-horizontal">
                    <SetShipmentStatusButton shipmentId={shipment.id} status="IN_TRANSIT" label="Mark in transit" />
                    <SetShipmentStatusButton shipmentId={shipment.id} status="AT_CUSTOMS" label="Mark at customs" />
                    <SetShipmentStatusButton shipmentId={shipment.id} status="DELIVERED" label="Mark delivered" variant="primary" />
                  </div>

                  <div className="divider" />

                  <div className="shipment-card__customs">
                    <h4>Customs declaration</h4>
                    {customs ? (
                      <div className="customs-summary">
                        <p>
                          Status: <strong>{customs.status || "SUBMITTED"}</strong>
                        </p>
                        <p>HS Code: {customs.data?.hsCode || "—"}</p>
                        <p>Docs: {(customs.data?.docs || []).join(", ") || "—"}</p>
                        <div className="stack-horizontal">
                          <SetCustomsStatusButton customsId={customs.id} status="CLEARED" label="Mark customs cleared" />
                        </div>
                      </div>
                    ) : (
                      <p className="section-subtitle">No customs declaration linked yet.</p>
                    )}
                    <AttachCustomsForm shipmentId={shipment.id} customs={customs} />
                  </div>

                  <div className="divider" />

                  <Link className="link-muted" href={orderHref}>
                    View order →
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <h3>No shipments yet</h3>
            <p>Create a shipment from any order to begin tracking logistics.</p>
          </div>
        )}
      </section>
    </main>
  );
}

