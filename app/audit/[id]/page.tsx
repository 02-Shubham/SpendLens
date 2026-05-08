import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { AuditSummary, AuditResult, RecommendationType } from "@/types/audit";
import AISummaryCard from "@/components/ai-summary-card";
import LeadCaptureForm from "@/components/lead-capture-form";
import ShareSection from "@/components/share-section";

// Fetch and memoize — used in both generateMetadata and the page
const getAudit = cache(async (shareToken: string) => {
  const { data, error } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq("share_token", shareToken)
    .single();

  if (error || !data) return null;
  return data as {
    id: string;
    share_token: string;
    audit_result: AuditSummary;
    total_monthly_savings: number;
    team_size: number;
    tools_input: unknown;
  };
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) {
    return { title: "Audit not found — SpendLens" };
  }
  const savings = Math.round(audit.total_monthly_savings);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://spendlens.app";
  const url = `${baseUrl}/audit/${id}`;

  return {
    title: `SpendLens — $${savings}/month in AI savings found`,
    description: `See how this team can save $${savings}/mo on their AI tool spend.`,
    openGraph: {
      title: `SpendLens — $${savings}/month in AI savings found`,
      description: `See how this team can save $${savings}/mo on their AI tool spend.`,
      url,
      images: [{ url: `${baseUrl}/api/og?savings=${savings}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `SpendLens — $${savings}/month in AI savings found`,
      description: `See how this team can save $${savings}/mo on their AI tool spend.`,
      images: [`${baseUrl}/api/og?savings=${savings}`],
    },
  };
}

// Recommendation badge styles
const BADGE: Record<RecommendationType, { label: string; class: string }> = {
  optimal: {
    label: "Optimal ✓",
    class: "bg-green-100 text-green-700 border-green-200",
  },
  downgrade: {
    label: "Downgrade",
    class: "bg-amber-100 text-amber-700 border-amber-200",
  },
  switch: {
    label: "Switch",
    class: "bg-blue-100 text-blue-700 border-blue-200",
  },
  redundant: {
    label: "Redundant",
    class: "bg-red-100 text-red-700 border-red-200",
  },
};

function ToolCard({ result }: { result: AuditResult }) {
  const badge = BADGE[result.recommendation] ?? BADGE.optimal;
  const hasSeatsInfo =
    result.currentMonthlyCost > 0 &&
    result.toolName !== "Anthropic API" &&
    result.toolName !== "OpenAI API";

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="p-5">
        {/* Tool name + badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{result.toolName}</h3>
            <p className="text-sm text-gray-500">{result.currentPlan}</p>
          </div>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.class}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Cost math */}
        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-sm text-gray-600">
          {hasSeatsInfo ? (
            <>Current cost — ${result.currentMonthlyCost.toFixed(0)}/mo</>
          ) : (
            <>Monthly spend — ${result.currentMonthlyCost.toFixed(0)}/mo</>
          )}
        </div>

        {/* Recommended action */}
        <p className="text-sm text-gray-700">{result.recommendedAction}</p>

        {/* Savings */}
        {result.monthlySavings > 0 && (
          <p className="mt-2 text-sm font-semibold text-green-600">
            Save ${Math.round(result.monthlySavings)}/mo · $
            {Math.round(result.annualSavings)}/yr
          </p>
        )}
      </div>

      {/* Collapsible reasoning */}
      <details className="border-t border-gray-100">
        <summary className="px-5 py-2.5 text-xs text-gray-400 cursor-pointer hover:text-gray-600 list-none flex items-center gap-1 select-none">
          <span className="text-[10px]">▶</span> Why this recommendation
        </summary>
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
          {result.reasoning}
        </p>
      </details>
    </div>
  );
}

export default async function AuditResultsPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) notFound();

  const summary: AuditSummary = audit.audit_result;
  const totalMonthly = Math.round(summary.totalMonthlySavings);
  const totalAnnual = Math.round(summary.totalAnnualSavings);
  const hasSavings = totalMonthly > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded">
            <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="font-semibold text-gray-900">SpendLens</span>
          </a>
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded"
          >
            ← New audit
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* 1. Hero */}
        <section className="text-center space-y-2" aria-label="Savings summary">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Your AI spend audit
          </p>
          <h1
            className={`text-6xl font-extrabold tracking-tight ${
              hasSavings ? "text-green-600" : "text-gray-400"
            }`}
          >
            {hasSavings ? `Save $${totalMonthly}/mo` : "Spend is optimised"}
          </h1>
          <p className="text-lg text-gray-600">
            {hasSavings
              ? `That's $${totalAnnual}/year — here's exactly how`
              : "No obvious savings found with your current setup"}
          </p>

          {/* Credex CTA for high-savings audits */}
          {summary.hasHighSavings && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-md">
              <span>💡</span>
              <span>
                Get these savings + more through Credex credits{" "}
                <span aria-hidden="true">→</span>
              </span>
            </div>
          )}
        </section>

        {/* 2. AI Summary */}
        <section aria-label="AI analysis">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            AI Summary
          </h2>
          <AISummaryCard auditSummary={summary} />
        </section>

        {/* 3. Per-tool breakdown */}
        <section aria-label="Tool breakdown">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tool Breakdown
          </h2>
          <div className="space-y-3">
            {summary.results.map((result) => (
              <ToolCard key={result.toolName} result={result} />
            ))}
          </div>
        </section>

        {/* 4. Email capture */}
        <section aria-label="Email capture">
          <LeadCaptureForm
            shareToken={audit.share_token}
            hasHighSavings={summary.hasHighSavings}
            totalMonthlySavings={summary.totalMonthlySavings}
          />
        </section>

        {/* 5. Share */}
        <section aria-label="Share this audit">
          <ShareSection shareToken={audit.share_token} />
        </section>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          SpendLens · AI tool spend analysis · Built by Credex
        </div>
      </footer>
    </div>
  );
}
