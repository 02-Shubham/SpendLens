"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadFormProps {
  shareToken: string;
  hasHighSavings: boolean;
  totalMonthlySavings: number;
}

export default function LeadCaptureForm({
  shareToken,
  hasHighSavings,
  totalMonthlySavings,
}: LeadFormProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot trap
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Silently ignore if bot filled the honeypot
    if (honeypot) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken, email, companyName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-6 text-center space-y-2">
        <div className="text-2xl">✓</div>
        <p className="font-semibold text-green-800">Report sent!</p>
        <p className="text-sm text-green-700">
          {hasHighSavings
            ? `A Credex advisor will reach out within 24 hours to help you capture $${Math.round(totalMonthlySavings)}/mo in savings.`
            : "Check your inbox — your full SpendLens report is on its way."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 bg-white rounded-xl p-6 space-y-4"
      noValidate
    >
      <div>
        <h2 className="font-semibold text-gray-900">Get this report in your inbox</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          We&apos;ll send a clean PDF summary — no spam, unsubscribe anytime.
        </p>
      </div>

      {/* Honeypot — hidden from real users, visible to bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website (leave blank)</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="lead-email">Work email *</Label>
        <Input
          id="lead-email"
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="lead-company">Company (optional)</Label>
          <Input
            id="lead-company"
            type="text"
            placeholder="Acme Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lead-role">Role (optional)</Label>
          <Input
            id="lead-role"
            type="text"
            placeholder="e.g. CTO, Engineering Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <button
        id="send-report"
        type="submit"
        disabled={submitting || !email}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {submitting ? "Sending…" : "Send my report"}
      </button>
    </form>
  );
}
