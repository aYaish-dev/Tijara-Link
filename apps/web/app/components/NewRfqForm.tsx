"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export default function NewRfqForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formEl = e.currentTarget;

    try {
      const form = new FormData(formEl);
      await api.createRfq({
        title: form.get("title"),
        details: form.get("details"),
        destinationCountry: form.get("dest") || "PS",
      });

      router.refresh();
      formEl.reset();
    } catch (error) {
      console.error("Failed to submit RFQ", error);
      alert("Something went wrong while creating the RFQ. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="rfq-title">Project title</Label>
          <Input
            id="rfq-title"
            name="title"
            placeholder="Example: Logistics support for Q3 expansion"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rfq-details">Overview</Label>
          <Textarea
            id="rfq-details"
            name="details"
            placeholder="Outline the scope, volumes, or any specifications suppliers should know."
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rfq-destination">Destination country</Label>
          <Input id="rfq-destination" name="dest" placeholder="PS" defaultValue="PS" disabled={loading} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:justify-between">
        <Button type="submit" disabled={loading} className="min-w-[180px]">
          {loading ? "Publishing..." : "Publish RFQ"}
        </Button>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Buyers are notified instantly. You can edit RFQ details anytime.
        </p>
      </div>
    </form>
  );
}
