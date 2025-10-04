"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRfqForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // خُزّن المرجع قبل أي await
    const formEl = e.currentTarget;

    try {
      const form = new FormData(formEl);
      const payload = {
        title: form.get("title"),
        details: form.get("details"),
        destinationCountry: form.get("dest") || "PS",
      };

      const res = await fetch(`${API_BASE}/rfq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Failed to create RFQ");
        return;
      }

      router.refresh();
      // امسح الحقول بأمان
      formEl.reset();
    } catch (error) {
      console.error("Failed to submit RFQ", error);
      alert("Something went wrong while creating the RFQ. Please try again.");
      return;
    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={onSubmit} className="space-y-3 border p-4 rounded-md">
      <h2 className="font-semibold">Create RFQ</h2>
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="Title"
          className="border p-2 flex-1"
          required
        />
        <input
          name="details"
          placeholder="Details"
          className="border p-2 flex-1"
        />
        <input
          name="dest"
          placeholder="PS"
          className="border p-2 w-28"
          defaultValue="PS"
        />
      </div>
      <button
        disabled={loading}
        className="bg-black text-white px-3 py-2 rounded"
      >
        {loading ? "Saving..." : "Create RFQ"}
      </button>
    </form>
  );
}
