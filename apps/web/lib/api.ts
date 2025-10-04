const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
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
  }
};
