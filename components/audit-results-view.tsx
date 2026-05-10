"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuditSummary, AuditResult, RecommendationType } from "@/types/audit";
import AISummaryCard from "@/components/ai-summary-card";
import LeadCaptureForm from "@/components/lead-capture-form";
import ShareSection from "@/components/share-section";
import { Copy, Check, ChevronDown, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditResultsViewProps {
  audit: {
    share_token: string;
    audit_result: AuditSummary;
    total_monthly_savings: number;
    team_size: number;
  };
}

const VERDICT_BADGES: Record<RecommendationType, { label: string; class: string }> = {
  optimal:   { label: "Optimal",   class: "badge-optimal" },
  downgrade: { label: "Downgrade", class: "badge-downgrade" },
  switch:    { label: "Switch",    class: "badge-switch" },
  redundant: { label: "Redundant", class: "badge-redundant" },
  expand:    { label: "Expand",    class: "badge-switch" },
  upgrade:   { label: "Upgrade",   class: "badge-downgrade" },
};

function CountUp({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease out expo
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
}

function ToolBreakdownCard({ result, index }: { result: AuditResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const badge = VERDICT_BADGES[result.recommendation];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.5, duration: 0.3 }}
      className="rounded-lg border border-border bg-surface p-6 mb-3"
    >
      {/* TOP ROW */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-semibold text-text-primary">
            {result.toolName}
          </span>
          <span className="px-2 py-0.5 bg-surface-2 text-text-tertiary text-[11px] font-medium rounded-full uppercase tracking-wider">
            {result.currentPlan}
          </span>
        </div>
        <span className={`badge-base ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-8 mb-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary mb-1">Current</p>
          <div className="font-mono text-[20px] text-text-primary">
            ${result.currentMonthlyCost.toFixed(0)}/mo
          </div>
          {result.currentMonthlyCost > 0 && (
            <p className="text-[13px] text-text-tertiary">Estimated spend</p>
          )}
        </div>

        <div className="text-text-tertiary">
          <ArrowRight className="h-4 w-4" />
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary mb-1">Recommended</p>
          <div className="font-mono text-[20px] text-green-600">
            ${result.projectedMonthlyCost.toFixed(0)}/mo
          </div>
          <p className="text-[13px] text-text-tertiary">Optimised spend</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-md p-3 text-center min-w-[120px]">
          <div className="font-mono text-[14px] font-semibold text-green-700">
            Save ${Math.round(result.monthlySavings)}/mo
          </div>
          <div className="text-[11px] text-green-600">
            ${Math.round(result.annualSavings)}/yr
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="space-y-4">
        <p className="text-[14px] text-text-secondary leading-relaxed">
          {result.recommendedAction}
        </p>
        
        <div>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[13px] text-text-tertiary hover:text-text-primary transition-colors"
          >
            Show reasoning <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
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
                <p className="pt-3 text-[14px] text-text-secondary border-t border-border mt-3">
                  {result.reasoning}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function AuditResultsView({ audit }: AuditResultsViewProps) {
  const [copied, setCopied] = useState(false);
  const summary = audit.audit_result;
  const totalMonthly = Math.round(summary.totalMonthlySavings);
  const totalAnnual = Math.round(summary.totalAnnualSavings);
  const hasSavings = totalMonthly > 0;

  function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Results Navbar */}
      <header className="sticky top-0 z-50 h-[56px] border-b border-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[720px] items-center justify-between px-6">
          <Link href="/" className="font-serif text-[20px] text-text-primary">
            SpendLens
          </Link>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 rounded-sm border border-green-500 px-4 py-1.5 text-[13px] font-medium text-green-600 hover:bg-green-50 transition-all"
          >
            {copied ? (
              <>Copied <Check className="h-3.5 w-3.5" /></>
            ) : (
              <>Share this audit <Copy className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-green-50/30 py-16 text-center">
        <div className="mx-auto max-w-[720px] px-6">
          {hasSavings ? (
            <div className="space-y-4">
              <p className="text-[13px] text-text-tertiary">
                Audit complete · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-mono text-[72px] font-medium text-green-600">
                  $<CountUp value={totalMonthly} />
                </span>
                <span className="text-[24px] text-text-secondary">/month</span>
              </div>
              <p className="font-serif italic text-[20px] text-text-secondary">
                That&apos;s ${totalAnnual.toLocaleString()} per year your team could keep.
              </p>

              {summary.hasHighSavings && (
                <div className="mx-auto mt-8 max-w-[480px]">
                  <a 
                    href="https://credex.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-md border-l-green-500 border border-border bg-white p-4 text-left shadow-(--shadow-sm) hover:bg-green-50 transition-all group"
                  >
                    <span className="text-[14px] font-medium text-text-primary">
                      Capture even more savings through Credex AI credits
                    </span>
                    <ExternalLink className="h-4 w-4 text-text-tertiary group-hover:text-green-600 transition-colors" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                <Check className="h-8 w-8" />
              </div>
              <h1 className="font-serif text-[32px] text-text-primary">
                Your team is spending efficiently.
              </h1>
              <p className="text-[16px] text-text-secondary">
                We found no obvious optimizations for your current stack.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-[720px] px-6 mt-12 space-y-12">
        {/* AI Summary */}
        <section>
          <AISummaryCard auditSummary={summary} />
        </section>

        {/* Tool Breakdown */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Tool by tool breakdown
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <div className="space-y-4">
            {summary.results.map((result, i) => (
              <ToolBreakdownCard key={`${result.toolName}-${i}`} result={result} index={i} />
            ))}
          </div>
        </section>

        {/* Lead Capture */}
        <section>
          <LeadCaptureForm 
            shareToken={audit.share_token}
            hasHighSavings={summary.hasHighSavings}
            totalMonthlySavings={summary.totalMonthlySavings}
          />
        </section>

        {/* Share Section */}
        <section>
          <ShareSection shareToken={audit.share_token} />
        </section>
      </main>

      <footer className="mt-16 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] text-text-tertiary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Start a new audit
        </Link>
      </footer>
    </div>
  );
}
