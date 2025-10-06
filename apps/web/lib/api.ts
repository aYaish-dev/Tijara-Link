export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:3001";

type MaybeWithError<T> = T & { error?: boolean; message?: string };

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text().catch(() => "");
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error("Failed to parse API response");
  }
}

function ensureNoError<T>(data: MaybeWithError<T>): T {
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(data.message || "API error");
  }
  return data as T;
}

export type ApiRfq = {
  id: string;
  title: string;
  status?: string | null;
  details?: string | null;
  destinationCountry?: string | null;
  createdAt?: string;
};

export type ApiQuote = {
  id: string;
  supplierId?: string | null;
  status?: string | null;
  currency?: string | null;
  pricePerUnitMinor: number;
  moq?: number | null;
  leadTimeDays?: number | null;
};

export type ApiEscrow = {
  released: boolean;
  heldMinor: number;
  currency: string;
};

export type ApiCustoms = {
  id: string;
  status?: string | null;
  data?: {
    hsCode?: string;
    docs?: string[];
  } | null;
  submittedAt?: string | null;
  clearedAt?: string | null;
};

export type ApiShipment = {
  id: string;
  mode?: string | null;
  tracking?: string | null;
  status?: string | null;
  customs: ApiCustoms | null;
};

export type ApiContract = {
  id: string;
  hash: string;
  terms?: string | null;
  createdAt?: string;
  buyerSignedAt?: string | null;
  supplierSignedAt?: string | null;
};

export type ApiReview = {
  id?: string;
  rating: number;
  comment?: string | null;
  orderId?: string;
  supplierCompanyId?: string;
  createdAt?: string;
};

export type ApiOrder = {
  id: string;
  status?: string | null;
  totalMinor?: number;
  totalCurrency?: string | null;
  createdAt?: string;
  buyerId: string | null;
  supplierId: string | null;
  escrow?: ApiEscrow | null;
  shipments: ApiShipment[];
  contract?: ApiContract | null;
  review: ApiReview | null;
};

async function request<T>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const data = await parseJson<T | MaybeWithError<T>>(response);
  return ensureNoError(data as MaybeWithError<T>);
}

export const api = {
  async listRfq(): Promise<ApiRfq[]> {
    return request<ApiRfq[]>(`${API_BASE}/rfq`, { cache: "no-store" });
  },

  async createRfq(payload: {
    title: FormDataEntryValue | null;
    details: FormDataEntryValue | null;
    destinationCountry: FormDataEntryValue | null;
  }): Promise<ApiRfq> {
    return request<ApiRfq>(`${API_BASE}/rfq`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        details: payload.details,
        destinationCountry: payload.destinationCountry,
      }),
    });
  },

  async listQuotesByRfq(rfqId: string): Promise<ApiQuote[]> {
    return request<ApiQuote[]>(`${API_BASE}/quotes/rfq/${rfqId}`, {
      cache: "no-store",
    });
  },

  async acceptQuote(quoteId: string) {
    return request(`${API_BASE}/quotes/${quoteId}/accept`, {
      method: "POST",
    });
  },

  async createOrder(payload: {
    quoteId: string;
    totalMinor?: number;
    totalCurrency?: string | null;
  }): Promise<ApiOrder> {
    return request<ApiOrder>(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async getOrder(id: string): Promise<ApiOrder> {
    return request<ApiOrder>(`${API_BASE}/orders/${id}`, { cache: "no-store" });
  },

  async releaseEscrow(orderId: string) {
    return request(`${API_BASE}/orders/${orderId}/escrow/release`, {
      method: "POST",
    });
  },

  async createShipment(
    orderId: string,
    payload: {
      mode?: string;
      trackingNumber?: string;
    }
  ): Promise<ApiShipment> {
    return request<ApiShipment>(`${API_BASE}/orders/${orderId}/shipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async setShipmentStatus(shipmentId: string, status: string) {
    return request(`${API_BASE}/shipments/${shipmentId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },

  async attachCustoms(
    shipmentId: string,
    payload: { data: { hsCode?: string; docs?: string[] }; status: string }
  ) {
    return request(`${API_BASE}/shipments/${shipmentId}/customs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async setCustomsStatus(customsId: string, status: string) {
    return request(`${API_BASE}/customs/${customsId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },

  async createContract(orderId: string, terms: string) {
    return request<ApiContract>(`${API_BASE}/contracts/order/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terms }),
    });
  },

  async signContract(contractId: string, role: "buyer" | "supplier") {
    return request(`${API_BASE}/contracts/${contractId}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
  },

  async upsertReview(orderId: string, rating: number, comment: string) {
    return request(`${API_BASE}/orders/${orderId}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
  },

  async listSupplierReviews(companyId: string) {
    return request<ApiReview[]>(`${API_BASE}/suppliers/${companyId}/reviews`, {
      cache: "no-store",
    });
  },
};
