"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuditSummary, AuditResult, RecommendationType } from "@/types/audit";
import AISummaryCard from "@/components/ai-summary-card";
import LeadCaptureForm from "@/components/lead-capture-form";
import {
  Copy, Check, ArrowLeft, ArrowRight, ExternalLink,
  ChevronDown, TrendingDown, Zap, Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditResultsViewProps {
  audit: {
    share_token: string;
    audit_result: AuditSummary;
    total_monthly_savings: number;
    team_size: number;
  };
}

// ─── Recommendation config ─────────────────────────────────────────────────────

const REC_CONFIG: Record<
  RecommendationType,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  optimal:   { label: "Optimal",   color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200", icon: <Check className="h-3.5 w-3.5" /> },
  downgrade: { label: "Downgrade", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200", icon: <TrendingDown className="h-3.5 w-3.5" /> },
  switch:    { label: "Switch",    color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  icon: <ArrowRight className="h-3.5 w-3.5" /> },
  redundant: { label: "Redundant", color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",   icon: <Minus className="h-3.5 w-3.5" /> },
  upgrade:   { label: "Upgrade",   color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  icon: <Zap className="h-3.5 w-3.5" /> },
};

// ─── CountUp ──────────────────────────────────────────────────────────────────

function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
}

// ─── Tool Breakdown Card ───────────────────────────────────────────────────────

function ToolBreakdownCard({ result, index }: { result: AuditResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = REC_CONFIG[result.recommendation];
  const hasSavings = result.monthlySavings > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 + 0.3, duration: 0.3, ease: "easeOut" }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[15px] font-semibold text-gray-900">{result.toolName}</span>
            <span className="ml-2 text-[12px] text-gray-400 font-medium">{result.currentPlan}</span>
          </div>
        </div>
        {/* <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          {cfg.icon} {cfg.label}
        </span> */}
      </div>

      {/* Cost flow */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          {/* Current */}
          <div className="flex-1 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Current</p>
            <p className="font-mono text-[18px] font-bold text-gray-900">
              ${result.currentMonthlyCost.toFixed(0)}
              <span className="text-[12px] font-normal text-gray-400">/mo</span>
            </p>
          </div>

          <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />

          {/* Projected */}
          <div className={`flex-1 rounded-lg px-4 py-3 border ${hasSavings ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"}`}>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Recommended</p>
            <p className={`font-mono text-[18px] font-bold ${hasSavings ? "text-green-700" : "text-gray-900"}`}>
              ${result.projectedMonthlyCost.toFixed(0)}
              <span className="text-[12px] font-normal text-gray-400">/mo</span>
            </p>
          </div>

          {/* Savings badge */}
          {hasSavings && (
            <div className="shrink-0 rounded-lg bg-green-600 px-3 py-3 text-center min-w-[90px]">
              <p className="text-[10px] text-green-100 font-semibold uppercase tracking-wider mb-0.5">Save</p>
              <p className="font-mono text-[16px] font-bold text-white">${Math.round(result.monthlySavings)}</p>
              <p className="text-[10px] text-green-200">${Math.round(result.annualSavings).toLocaleString()}/yr</p>
            </div>
          )}
        </div>

        {/* Action + Reasoning */}
        <p className="text-[14px] text-gray-700 leading-relaxed mb-3">
          {result.recommendedAction}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
        >
          Full reasoning
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[13px] text-gray-500 leading-relaxed">{result.reasoning}</p>
                {result.conditions && result.conditions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Before switching</p>
                    {result.conditions.map((c, i) => (
                      <p key={i} className="flex items-start gap-2 text-[12px] text-gray-500">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        {c}
                      </p>
                    ))}
                  </div>
                )}
                {result.confidenceLevel && (
                  <span className={`mt-3 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    result.confidenceLevel === "high"   ? "bg-green-50 text-green-700" :
                    result.confidenceLevel === "medium" ? "bg-amber-50 text-amber-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {result.confidenceLevel} confidence
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Credex CTA ────────────────────────────────────────────────────────────────

function CredexCTA({ totalMonthly }: { totalMonthly: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-8 text-white"
    >
      {/* Glow orb */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green-400/10 blur-3xl" />

      <div className="relative">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-green-200">
          <Zap className="h-3 w-3" /> Maximize your savings
        </div>

        <h3 className="mt-4 font-serif text-[28px] leading-tight text-white">
          Capture even more than{" "}
          <span className="text-green-300">${totalMonthly.toLocaleString()}/mo</span>
        </h3>
        <p className="mt-2 text-[15px] text-green-100/80 max-w-md">
          Credex helps companies negotiate enterprise credits and vendor discounts on top of
          these optimizations — typically unlocking an extra 15–30% off your AI bill.
        </p>

        <a
          href="https://credex.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-green-800 hover:bg-green-50 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
        >
          Talk to Credex <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}

// ─── Optimal CTA ──────────────────────────────────────────────────────────────

function OptimalCTA() {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/60 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <Check className="h-7 w-7 text-green-600" />
      </div>
      <h3 className="font-serif text-[24px] text-gray-900">
        You&apos;re spending well.
      </h3>
      <p className="mt-2 text-[15px] text-gray-500 max-w-sm mx-auto">
        No obvious savings found for your current stack. We&apos;ll notify you
        when new optimizations apply.
      </p>
    </div>
  );
}

// ─── Share Strip ──────────────────────────────────────────────────────────────

function ShareStrip({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/audit/${shareToken}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const tweetText = encodeURIComponent(
    `Just ran a free AI stack audit on SpendLens — found real savings in under 2 minutes. Try yours:\n${url}`
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-gray-400 mb-4">
        Share this audit
      </p>
      <p className="text-[15px] text-gray-700 mb-5 max-w-sm">
        Know someone overpaying for AI tools? Send them this link — it&apos;s public and anonymous.
      </p>

      {/* URL bar */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1.5 mb-4">
        <input
          readOnly
          value={url}
          className="flex-1 bg-transparent px-3 text-[13px] text-gray-500 outline-none truncate"
        />
        <button
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold px-4 py-2 rounded-md transition-all active:scale-95"
        >
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy link</>}
        </button>
      </div>

      {/* Tweet button */}
      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Post on X / Twitter
      </a>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function AuditResultsView({ audit }: AuditResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const summary = audit.audit_result;
  const totalMonthly = Math.round(summary.totalMonthlySavings);
  const totalAnnual  = Math.round(summary.totalAnnualSavings);
  const hasSavings = totalMonthly > 0;
  const hasHighSavings = summary.hasHighSavings; // >$500/mo

  // Low-savings threshold — be honest
  const isAlreadyOptimal = !hasSavings ||
    (totalMonthly < 100 && summary.results.every(r => r.recommendation === "optimal"));

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const auditUrl = `${baseUrl}/audit/${audit.share_token}`;

  function copyLink() {
    navigator.clipboard.writeText(auditUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-24">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[60px] max-w-[760px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SpendLens" width={28} height={28} className="h-auto w-auto" />
            <span className="font-serif text-[20px] font-bold text-gray-900">SpendLens</span>
          </Link>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-[13px] font-semibold text-green-700 hover:bg-green-100 transition-all active:scale-95"
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Share audit</>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[760px] px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {hasSavings ? (
              <div className="space-y-3">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400">
                  Audit complete
                </p>
                <h1 className="font-serif text-[56px] md:text-[72px] leading-none font-bold text-gray-900">
                  <span className="text-green-600">$<CountUp value={totalMonthly} /></span>
                  <span className="text-gray-400 text-[32px] md:text-[40px] font-normal">/month</span>
                </h1>
                <p className="text-[18px] text-gray-500">
                  That&apos;s{" "}
                  <span className="font-semibold text-gray-800">
                    ${totalAnnual.toLocaleString()} per year
                  </span>{" "}
                  your team can reclaim.
                </p>

                {/* Quick stats row */}
                <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
                  {[
                    { label: "Tools audited", value: summary.results.length },
                    { label: "Recommendations", value: summary.results.filter(r => r.recommendation !== "optimal").length },
                    { label: "Annual savings", value: `$${totalAnnual.toLocaleString()}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center px-6 first:pl-0 last:pr-0 border-r border-gray-200 last:border-0">
                      <div className="text-[22px] font-bold font-mono text-gray-900">{value}</div>
                      <div className="text-[12px] text-gray-400 font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="font-serif text-[40px] text-gray-900">
                  You&apos;re spending well.
                </h1>
                <p className="text-[17px] text-gray-500 max-w-sm mx-auto">
                  No obvious optimizations found for your current AI stack.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto max-w-[760px] px-6 mt-10 space-y-10">

        {/* Cross-stack insights */}
        {summary.insights && summary.insights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 shrink-0">
                Stack insights
              </h2>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="space-y-2">
              {summary.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-white border border-gray-100 shadow-sm px-5 py-4">
                  <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                    <Zap className="h-3 w-3 text-amber-600" />
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Credex CTA — only for >$500/mo */}
        {hasHighSavings && (
          <section>
            <CredexCTA totalMonthly={totalMonthly} />
          </section>
        )}

        {/* AI Summary */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 shrink-0">
              AI summary
            </h2>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <AISummaryCard auditSummary={summary} />
        </section>

        {/* Per-tool breakdown */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 shrink-0">
              Tool breakdown
            </h2>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="space-y-3">
            {summary.results.map((result, i) => (
              <ToolBreakdownCard key={`${result.toolName}-${i}`} result={result} index={i} />
            ))}
          </div>
        </section>

        {/* Lead capture */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 shrink-0">
              {isAlreadyOptimal ? "Stay updated" : "Get your report"}
            </h2>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          {isAlreadyOptimal && (
            <div className="mb-4">
              <OptimalCTA />
            </div>
          )}
          <LeadCaptureForm
            shareToken={audit.share_token}
            hasHighSavings={hasHighSavings}
            totalMonthlySavings={summary.totalMonthlySavings}
          />
        </section>

        {/* Share section */}
        <section>
          <ShareStrip shareToken={audit.share_token} />
        </section>

        {/* Footer */}
        <footer className="text-center pb-8">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 text-[14px] text-gray-400 hover:text-gray-700 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Run a new audit
          </Link>
        </footer>
      </main>
    </div>
  );
}
