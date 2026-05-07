"use client";

import { useState, useEffect } from "react";
import { AuditSummary } from "@/types/audit";
import { Skeleton } from "@/components/ui/skeleton";

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
        className="border border-gray-200 rounded-xl p-5 space-y-3 bg-white"
        aria-label="Loading AI summary"
        aria-busy="true"
      >
        <Skeleton className="h-4 w-24 skeleton-shimmer" />
        <Skeleton className="h-4 w-full skeleton-shimmer" />
        <Skeleton className="h-4 w-5/6 skeleton-shimmer" />
        <Skeleton className="h-4 w-4/6 skeleton-shimmer" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <blockquote className="border-l-4 border-green-500 bg-green-50 rounded-r-xl px-5 py-4">
      <p className="text-sm leading-relaxed text-gray-700 italic">{summary}</p>
      <footer className="mt-2 text-xs text-gray-400">— SpendLens AI Analysis</footer>
    </blockquote>
  );
}
