'use client'
import { useEffect, useState } from 'react'

type Rfq = { id: string; title: string; status: string }

export default function RFQList() {
  const [rfqs, setRfqs] = useState<Rfq[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/rfq';
    fetch(url)
      .then(async (r) => {
        const data = await r.json().catch(() => (null))
        if (Array.isArray(data)) {
          setRfqs(data)
        } else {
          setRfqs([])
          setErr('API returned non-list response')
          console.warn('RFQ API unexpected:', data)
        }
      })
      .catch((e) => { setErr(e.message || 'fetch failed'); setRfqs([]) })
  }, [])

  return (
    <main className="p-8">
      <h2 className="text-xl font-semibold">RFQs</h2>
      {err && <p className="mt-2 text-red-600">⚠ {err}</p>}
      <ul className="mt-4 space-y-2">
        {rfqs.map(x => <li key={x.id} className="border p-3 rounded">{x.title} — {x.status}</li>)}
      </ul>
      {(!err && rfqs.length === 0) && <p className="mt-4 text-gray-500">لا توجد RFQs بعد.</p>}
    </main>
  )
}
