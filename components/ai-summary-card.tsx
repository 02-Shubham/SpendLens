"use client";

import { useState, useEffect } from "react";
import { AuditSummary } from "@/types/audit";

interface AISummaryProps {
  auditSummary: AuditSummary;
}

export default function AISummaryCard({ auditSummary }: AISummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditSummary }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setSummary(d.summary || null);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div
        className="mx-auto max-w-[680px] rounded-lg border border-border bg-surface p-6 space-y-4"
        aria-label="Loading AI summary"
        aria-busy="true"
      >
        <div className="h-[14px] w-full animate-pulse rounded bg-surface-2" />
        <div className="h-[14px] w-[90%] animate-pulse rounded bg-surface-2" />
        <div className="h-[14px] w-[75%] animate-pulse rounded bg-surface-2" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="mx-auto max-w-[680px] rounded-lg border border-border bg-surface p-6 relative">
      <div className="">
        <p className="font-serif text-[17px] text-text-secondary">
          {summary}
        </p>
      </div>
    </div>
  );
}
