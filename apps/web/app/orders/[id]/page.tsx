import Link from "next/link";

import {
  api,
  ApiOrder,
  ApiShipment,
} from "@/lib/api";
import ReleaseEscrowButton from "@/app/components/ReleaseEscrowButton";
import CreateShipmentForm from "@/app/components/CreateShipmentForm";
import SetShipmentStatusButton from "@/app/components/SetShipmentStatusButton";
import AttachCustomsForm from "@/app/components/AttachCustomsForm";
import SetCustomsStatusButton from "@/app/components/SetCustomsStatusButton";
import CreateContractForm from "@/app/components/CreateContractForm";
import SignContractButton from "@/app/components/SignContractButton";
import ReviewForm from "@/app/components/ReviewForm";

export const dynamic = "force-dynamic";

function formatCurrency(totalMinor?: number, currency?: string | null) {
  if (totalMinor == null) return "—";
  const amount = totalMinor / 100;
  return `${currency || "USD"} ${amount.toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function shipmentStatusBadge(status?: string | null) {
  const normalized = String(status || "pending").toLowerCase();
  if (/(delivered|cleared)/.test(normalized)) return "status-pill status-pill--approved";
  if (/(customs|hold)/.test(normalized)) return "status-pill status-pill--pending";
  return "status-pill status-pill--draft";
}

function ShipmentActions({ shipment }: { shipment: ApiShipment }) {
  return (
    <div className="stack-horizontal">
      <SetShipmentStatusButton
        shipmentId={shipment.id}
        status="IN_TRANSIT"
        label="Mark in transit"
      />
      <SetShipmentStatusButton
        shipmentId={shipment.id}
        status="AT_CUSTOMS"
        label="Mark at customs"
      />
      <SetShipmentStatusButton
        shipmentId={shipment.id}
        status="DELIVERED"
        label="Mark delivered"
        variant="primary"
      />
    </div>
  );
}

export default async function OrderPage({ params }: { params: { id: string } }) {
  const { id } = params;

  let order: ApiOrder | null = null;
  try {
    order = await api.getOrder(id);
  } catch (error) {
    console.error("Failed to load order", error);
  }

  if (!order) {
    return (
      <main className="detail-page">
        <header className="detail-header">
          <div>
            <p className="eyebrow">Order not found</p>
            <h1>{id}</h1>
          </div>
          <Link className="button-secondary" href="/">
            ← Back to overview
          </Link>
        </header>
        <div className="alert alert--error">We could not locate this order.</div>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <p className="eyebrow">Order #{order.id}</p>
          <h1>{formatCurrency(order.totalMinor, order.totalCurrency)}</h1>
          <p className="section-subtitle">
            Status: {order.status || "Pending"} • Created {formatDate(order.createdAt)} • Buyer {order.buyerId ?? "—"} • Supplier {" "}
            {order.supplierId ?? "—"}
          </p>
        </div>
        <Link className="button-secondary" href="/rfq">
          ← Back to RFQs
        </Link>
      </header>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Escrow</h2>
            <p className="section-subtitle">
              Release funds once goods are cleared and delivered to the buyer.
            </p>
          </div>
        </div>
        {order.escrow ? (
          <div className="info-grid">
            <div>
              <p className="eyebrow">Held amount</p>
              <p className="info-value">
                {formatCurrency(order.escrow.heldMinor, order.escrow.currency)}
              </p>
            </div>
            <div>
              <p className="eyebrow">Released</p>
              <p className="info-value">{order.escrow.released ? "Yes" : "No"}</p>
            </div>
            {!order.escrow.released && (
              <div>
                <ReleaseEscrowButton orderId={order.id} />
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No escrow</h3>
            <p>This order has no escrow record yet.</p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Shipments</h2>
            <p className="section-subtitle">
              Create consignments, attach customs, and keep status aligned with operations.
            </p>
          </div>
          <span className="badge-inline">{order.shipments.length} records</span>
        </div>

        <CreateShipmentForm orderId={order.id} />

        {order.shipments.length ? (
          <ul className="list-stack">
            {order.shipments.map((shipment) => (
              <li key={shipment.id} className="shipment-card">
                <div className="shipment-card__header">
                  <div>
                    <p className="eyebrow">Shipment #{shipment.id}</p>
                    <h3>{shipment.mode || "Mode not set"}</h3>
                  </div>
                  <span className={shipmentStatusBadge(shipment.status)}>{shipment.status || "Pending"}</span>
                </div>
                <p className="section-subtitle">Tracking: {shipment.tracking || "—"}</p>
                <ShipmentActions shipment={shipment} />

                <div className="divider" />

                <div className="shipment-card__customs">
                  <h4>Customs declaration</h4>
                  {shipment.customs ? (
                    <div className="customs-summary">
                      <p>
                        Status: <strong>{shipment.customs.status || "SUBMITTED"}</strong>
                      </p>
                      <p>HS Code: {shipment.customs.data?.hsCode || "—"}</p>
                      <p>Docs: {(shipment.customs.data?.docs || []).join(", ") || "—"}</p>
                      <div className="stack-horizontal">
                        <SetCustomsStatusButton
                          customsId={shipment.customs.id}
                          status="CLEARED"
                          label="Mark customs cleared"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="section-subtitle">No customs declaration linked yet.</p>
                  )}
                  <AttachCustomsForm shipmentId={shipment.id} customs={shipment.customs} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state" style={{ marginTop: "1rem" }}>
            <h3>No shipments yet</h3>
            <p>Logistics teams can add consignments as soon as the order is ready to move.</p>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Contract</h2>
            <p className="section-subtitle">
              Generate legally binding terms and capture buyer/supplier signatures.
            </p>
          </div>
        </div>

        {order.contract ? (
          <div className="contract-card">
            <div>
              <p className="eyebrow">Hash</p>
              <p className="info-value mono">{order.contract.hash}</p>
            </div>
            <div className="contract-meta">
              <p>Buyer: {order.contract.buyerSignedAt ? `Signed ${formatDate(order.contract.buyerSignedAt)}` : "Pending"}</p>
              <p>
                Supplier: {order.contract.supplierSignedAt
                  ? `Signed ${formatDate(order.contract.supplierSignedAt)}`
                  : "Pending"}
              </p>
            </div>
            <div className="stack-horizontal">
              <SignContractButton contractId={order.contract.id} role="buyer" />
              <SignContractButton contractId={order.contract.id} role="supplier" />
            </div>
          </div>
        ) : (
          <CreateContractForm orderId={order.id} />
        )}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Review</h2>
            <p className="section-subtitle">
              Capture buyer sentiment after delivery to feed supplier scorecards.
            </p>
          </div>
        </div>
        <ReviewForm orderId={order.id} review={order.review} />
      </section>
    </main>
  );
}
