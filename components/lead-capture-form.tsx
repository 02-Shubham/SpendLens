"use client";

import { useState } from "react";
import { ChevronDown, Check, Loader2, ArrowRight } from "lucide-react";

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
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <div className="mx-auto max-w-[480px] rounded-xl border border-border bg-surface p-8 text-center shadow-(--shadow-md) animate-slide-up">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-[24px] text-text-primary">Sent! Check your inbox.</h3>
        {hasHighSavings && (
          <p className="mt-2 text-[14px] text-text-secondary">
            + Our team at Credex will reach out within 24 hours.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] rounded-xl border border-border bg-surface p-8 shadow-(--shadow-md) my-12">
      <div className="mb-6 space-y-1">
        <h2 className="font-serif text-[24px] text-text-primary">
          Get this report in your inbox
        </h2>
        <p className="text-[14px] text-text-secondary">
          We&apos;ll email you the full breakdown. No spam — just your audit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Honeypot */}
        <input
          name="website"
          style={{ display: "none" }}
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        <div className="space-y-1.5">
          <input
            type="email"
            required
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-md border border-border bg-surface px-4 text-[15px] text-text-primary focus:outline-none focus:border-green-500 focus:ring-[3px] focus:ring-[rgba(34,197,94,0.15)] transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-[13px] text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Add company details <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>

        {showDetails && (
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            <input
              type="text"
              placeholder="Company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-11 rounded-md border border-border bg-surface px-3 text-[14px] focus:outline-none focus:border-green-500 transition-all"
            />
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-11 rounded-md border border-border bg-surface px-3 text-[14px] focus:outline-none focus:border-green-500 transition-all"
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md border border-red-100">
            {error}
          </p>
        )}

        <button
          id="send-report"
          type="submit"
          disabled={submitting || !email}
          className="w-full h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-medium rounded-md transition-all shadow-(--shadow-sm)"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send my report <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
