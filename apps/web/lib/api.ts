const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function ensureNoError<T extends Record<string, any>>(data: T): T {
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(data.message || "API error");
  }
  return data;
}

export const api = {
  // المستخدمة في app/page.tsx
  async listRfq(): Promise<Array<{ id: string; title: string; status: string; destinationCountry: string; createdAt: string }>> {
    const res = await fetch(`${BASE}/rfq`, { cache: "no-store" });
    return json(res);
  },

  // أمثلة إضافية إن حبيت تستعملها لاحقًا:
  async listQuotes(rfqId: string) {
    const res = await fetch(`${BASE}/quotes/rfq/${rfqId}`, { cache: "no-store" });
    return json(res);
  },
  async acceptQuote(id: string) {
    const res = await fetch(`${BASE}/quotes/${id}/accept`, { method: "POST" });
    return json(res);
  },

  async createOrder(payload: { quoteId: string; totalMinor?: number; totalCurrency?: string }) {
    const res = await fetch(`${BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureNoError(await json(res));
  },

  async getOrder(id: string) {
    const res = await fetch(`${BASE}/orders/${id}`, { cache: "no-store" });
    return ensureNoError(await json(res));
  },

  async releaseEscrow(orderId: string) {
    const res = await fetch(`${BASE}/orders/${orderId}/escrow/release`, { method: "POST" });
    return ensureNoError(await json(res));
  },

  async createShipment(orderId: string, payload: { mode?: string; trackingNumber?: string; tracking?: string }) {
    const res = await fetch(`${BASE}/orders/${orderId}/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureNoError(await json(res));
  },

  async setShipmentStatus(shipmentId: string, status: string) {
    const res = await fetch(`${BASE}/shipments/${shipmentId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return ensureNoError(await json(res));
  },

  async createCustoms(shipmentId: string, payload: { data?: Record<string, any>; status?: string | null }) {
    const res = await fetch(`${BASE}/shipments/${shipmentId}/customs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return ensureNoError(await json(res));
  },

  async updateCustomsStatus(customsId: string, status: string) {
    const res = await fetch(`${BASE}/customs/${customsId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return ensureNoError(await json(res));
  },

  async createContract(orderId: string, terms: string) {
    const res = await fetch(`${BASE}/contracts/order/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terms }),
    });
    return ensureNoError(await json(res));
  },

  async signContract(contractId: string, role: "buyer" | "supplier") {
    const res = await fetch(`${BASE}/contracts/${contractId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    return ensureNoError(await json(res));
  },

  async upsertReview(orderId: string, rating: number, comment: string) {
    const res = await fetch(`${BASE}/orders/${orderId}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    return ensureNoError(await json(res));
  }
};