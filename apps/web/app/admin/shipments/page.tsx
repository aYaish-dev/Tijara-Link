import Link from "next/link";

import { api, ApiCustoms, ApiOrder, ApiShipment } from "@/lib/api";
import SetShipmentStatusButton from "@/app/components/SetShipmentStatusButton";
import AttachCustomsForm from "@/app/components/AttachCustomsForm";
import SetCustomsStatusButton from "@/app/components/SetCustomsStatusButton";

export const dynamic = "force-dynamic";

function shipmentStatusBadge(status?: string | null) {
  const normalized = String(status || "BOOKED").toLowerCase();
  if (/(delivered|cleared)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(customs|hold)/.test(normalized)) return "status-pill status-pill--pending";
  return "status-pill status-pill--draft";
}

function normaliseCustoms(customs?: ApiCustoms[] | ApiCustoms | null): ApiCustoms | null {
  if (!customs) return null;
  if (Array.isArray(customs)) {
    return customs[0] ?? null;
  }
  return customs;
}

export default async function AdminShipmentsPage() {
  let orders: ApiOrder[] = [];
  let error: string | null = null;

  try {
    orders = await api.listOrders();
  } catch (err) {
    console.error("Failed to list orders for shipments", err);
    error = (err as Error)?.message || "Unable to load shipments";
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

        {shipments.length ? (
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
