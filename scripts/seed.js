// scripts/seed.js
// Seed end-to-end: RFQ -> Quote -> Accept -> Order -> Escrow -> Shipment -> Customs -> Contract -> Review

const BASE = process.env.API_BASE || 'http://localhost:3001';

async function jfetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, json: text };
  }
}

function logStep(title, data) {
  console.log(`\n=== ${title} ===`);
  console.log(data);
}

(async function main() {
  try {
    // 0) Health
    let r = await jfetch('/health');
    if (!r.ok) throw new Error('API not healthy');
    logStep('HEALTH', r.json);

    // 1) Create RFQ
    r = await jfetch('/rfq', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Steel RFQ (seed)',
        details: '20 tons',
        destinationCountry: 'PS',
      }),
    });
    if (!r.ok) throw new Error(`RFQ create failed: ${JSON.stringify(r.json)}`);
    const rfq = r.json;
    logStep('RFQ CREATED', rfq);

    // 2) Create Quote for that RFQ
    r = await jfetch('/quotes', {
      method: 'POST',
      body: JSON.stringify({
        rfqId: rfq.id,
        currency: 'USD',
        pricePerUnitMinor: 95000,
        moq: 5,
        leadTimeDays: 10,
      }),
    });
    if (!r.ok) throw new Error(`Quote create failed: ${JSON.stringify(r.json)}`);
    let quote = r.json;
    logStep('QUOTE CREATED', quote);

    // 3) Accept Quote (idempotent-ish)
    if (quote.status !== 'ACCEPTED') {
      r = await jfetch(`/quotes/${quote.id}/accept`, { method: 'POST' });
      if (!r.ok) throw new Error(`Quote accept failed: ${JSON.stringify(r.json)}`);
      quote = r.json;
    }
    logStep('QUOTE ACCEPTED', quote);

    // 4) Create Order from Quote
    r = await jfetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: quote.id,
        totalMinor: quote.pricePerUnitMinor,
        totalCurrency: quote.currency,
      }),
    });

    // Handle unique quoteId already used (run twice) – fetch existing by reusing last order id if response says unique constraint.
    if (!r.ok) throw new Error(`Order create failed: ${JSON.stringify(r.json)}`);
    const order = r.json;
    logStep('ORDER CREATED', order);

    // 5) Release escrow
    r = await jfetch(`/orders/${order.id}/escrow/release`, { method: 'POST' });
    if (!r.ok) throw new Error(`Escrow release failed: ${JSON.stringify(r.json)}`);
    logStep('ESCROW RELEASED', r.json);

    // 6) Create Shipment
    r = await jfetch(`/orders/${order.id}/shipments`, {
      method: 'POST',
      body: JSON.stringify({ mode: 'SEA', trackingNumber: 'TRK-SEED' }),
    });
    if (!r.ok) throw new Error(`Shipment create failed: ${JSON.stringify(r.json)}`);
    const shipment = r.json;
    logStep('SHIPMENT CREATED', shipment);

    // 7) Set Shipment status AT_CUSTOMS
    r = await jfetch(`/shipments/${shipment.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'AT_CUSTOMS' }),
    });
    if (!r.ok) throw new Error(`Shipment status update failed: ${JSON.stringify(r.json)}`);
    logStep('SHIPMENT STATUS -> AT_CUSTOMS', r.json);

    // 8) Attach Customs Declaration
    r = await jfetch(`/shipments/${shipment.id}/customs`, {
      method: 'POST',
      body: JSON.stringify({
        data: { hsCode: '7208.38', docs: ['invoice.pdf'] },
        status: 'SUBMITTED',
      }),
    });
    if (!r.ok) throw new Error(`Customs attach failed: ${JSON.stringify(r.json)}`);
    const decl = r.json;
    logStep('CUSTOMS SUBMITTED', decl);

    // 9) Create Contract
    r = await jfetch(`/contracts/order/${order.id}`, {
      method: 'POST',
      body: JSON.stringify({ terms: 'Basic TijaraLink contract terms v1' }),
    });
    if (!r.ok) throw new Error(`Contract create failed: ${JSON.stringify(r.json)}`);
    const contract = r.json;
    logStep('CONTRACT CREATED', contract);

    // 10) Sign contract (buyer then supplier)
    r = await jfetch(`/contracts/${contract.id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ role: 'buyer' }),
    });
    if (!r.ok) throw new Error(`Buyer sign failed: ${JSON.stringify(r.json)}`);
    logStep('CONTRACT SIGNED BY BUYER', r.json);

    r = await jfetch(`/contracts/${contract.id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ role: 'supplier' }),
    });
    if (!r.ok) throw new Error(`Supplier sign failed: ${JSON.stringify(r.json)}`);
    logStep('CONTRACT SIGNED BY SUPPLIER', r.json);

    // 11) Clear customs
    r = await jfetch(`/customs/${decl.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'CLEARED' }),
    });
    if (!r.ok) throw new Error(`Customs clear failed: ${JSON.stringify(r.json)}`);
    logStep('CUSTOMS CLEARED', r.json);

    // 12) Deliver shipment
    r = await jfetch(`/shipments/${shipment.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    if (!r.ok) throw new Error(`Shipment deliver failed: ${JSON.stringify(r.json)}`);
    logStep('SHIPMENT DELIVERED', r.json);

    // 13) Review supplier (PUT to allow update)
    r = await jfetch(`/orders/${order.id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ rating: 5, comment: 'excellent & on-time' }),
    });
    if (!r.ok) throw new Error(`Review upsert failed: ${JSON.stringify(r.json)}`);
    logStep('REVIEW UPSERTED', r.json);

    // 14) Final order snapshot
    r = await jfetch(`/orders/${order.id}`);
    logStep('FINAL ORDER SNAPSHOT', r.json);

    console.log('\n🎉 Seed finished successfully.');
  } catch (e) {
    console.error('\n❌ SEED FAILED:', e?.message || e);
    process.exit(1);
  }
})();
