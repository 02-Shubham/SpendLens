"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuditResult, AuditSummary, RecommendationType } from "@/types/audit";
import AISummaryCard from "@/components/ai-summary-card";
import LeadCaptureForm from "@/components/lead-capture-form";
import {
  ArrowLeft, ArrowRight, Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Lightbulb,
  Mail,
  Minus,
  PieChart,
  Share2,
  TrendingDown,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SiOpenai, SiAnthropic, SiGooglegemini, SiGithubcopilot, SiWindsurf } from "react-icons/si";

interface AuditResultsViewProps {
  audit: {
    share_token: string;
    audit_result: AuditSummary;
    total_monthly_savings: number;
    team_size: number;
    tools_input: unknown;
  };
}

// Map tool names → { icon, brand colour, container bg }
type ToolIconDef = {
  icon: React.ReactNode;
  bg: string;
  iconColor: string;
};

function getToolIconDef(toolName: string): ToolIconDef | null {
  switch (toolName) {
    case "ChatGPT":
    case "OpenAI API":
      return { icon: <SiOpenai className="h-5 w-5" />, bg: "bg-gray-950", iconColor: "text-white" };
    case "Claude":
    case "Anthropic API":
      return { icon: <SiAnthropic className="h-5 w-5" />, bg: "bg-amber-50", iconColor: "text-amber-700" };
    case "Gemini":
      return { icon: <SiGooglegemini className="h-5 w-5" />, bg: "bg-blue-50", iconColor: "text-blue-600" };
    case "GitHub Copilot":
      return { icon: <SiGithubcopilot className="h-5 w-5" />, bg: "bg-violet-50", iconColor: "text-violet-700" };
    case "Windsurf":
      return { icon: <SiWindsurf className="h-5 w-5" />, bg: "bg-cyan-50", iconColor: "text-cyan-700" };
    case "Cursor":
      return {
        icon: (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V16.42a2 2 0 0 0 1 1.732l7.5 4.33a3 3 0 0 0 3 0l7.5-4.33a2 2 0 0 0 1-1.732V7.577a2 2 0 0 0-1-1.732z" />
          </svg>
        ),bg: "bg-slate-900",iconColor: "text-white",
      };
    default:
      return null;
  }
}

const REC_CONFIG: Record<
  RecommendationType,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  optimal: {
    label: "Optimal",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-100",
    icon: <Check className="h-3.5 w-3.5" />,
  },
  downgrade: {
    label: "Downgrade",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: <TrendingDown className="h-3.5 w-3.5" />,
  },
  switch: {
    label: "Switch",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: <ArrowRight className="h-3.5 w-3.5" />,
  },
  redundant: {
    label: "Redundant",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-100",
    icon: <Minus className="h-3.5 w-3.5" />,
  },
  upgrade: {
    label: "Upgrade",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
};

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {children}
      </h2>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)] ${className}`}>
      {children}
    </div>
  );
}

function ToolMark({ result }: { result: AuditResult }) {
  const def = getToolIconDef(result.toolName);
  if (def) {
    return (
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${def.bg} ${def.iconColor}`}>
        {def.icon}
      </div>
    );
  }
  // Fallback: two-letter monogram
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
      <span className="text-[13px] font-bold">{result.toolName.slice(0, 2)}</span>
    </div>
  );
}


function SpendDonut({
  results,
  totalSpend,
}: {
  results: AuditResult[];
  totalSpend: number;
}) {
  const colors = ["#16a34a", "#22c55e", "#4ade80", "#d1d5db", "#94a3b8", "#60a5fa", "#f59e0b"];
  const segments = results.reduce<{ start: number; stops: string[] }>(
    (acc, result, index) => {
      const percent = totalSpend > 0 ? (result.currentMonthlyCost / totalSpend) * 100 : 0;
      return {
        start: acc.start + percent,
        stops: [
          ...acc.stops,
          `${colors[index % colors.length]} ${acc.start}% ${acc.start + percent}%`,
        ],
      };
    },
    { start: 0, stops: [] }
  ).stops;
  const gradient = segments.length ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#e5e7eb 0% 100%)";

  return (
    <DashboardCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">Spend breakdown</p>
        <PieChart className="h-4 w-4 text-slate-400" />
      </div>
      <div className="grid gap-6 sm:grid-cols-[190px_1fr] sm:items-center">
        <div className="relative mx-auto h-[190px] w-[190px] rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[24px] font-bold text-slate-950">{formatMoney(totalSpend)}</span>
            <span className="text-[13px] text-slate-500">/month</span>
          </div>
        </div>
        <div className="space-y-3">
          {results.slice(0, 5).map((result, index) => {
            const percent = totalSpend > 0 ? Math.round((result.currentMonthlyCost / totalSpend) * 100) : 0;
            return (
              <div key={`${result.toolName}-donut`} className="flex items-center gap-3 text-[14px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="flex-1 font-medium text-slate-800">{result.toolName}</span>
                <span className="text-slate-500">
                  {formatMoney(result.currentMonthlyCost)} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}


// function BenchmarkCard({
//   currentSpend,
//   projectedSpend,
//   teamSize,
// }: {
//   currentSpend: number;
//   projectedSpend: number;
//   teamSize: number;
// }) {
//   const size = Math.max(teamSize || 1, 1);
//   const currentPerEmployee = Math.round(currentSpend / size);
//   const optimizedPerEmployee = Math.round(projectedSpend / size);
//   const comparison = currentPerEmployee > 0 ? Math.round(((currentPerEmployee - optimizedPerEmployee) / currentPerEmployee) * 100) : 0;

//   return (
//     <DashboardCard className="p-5">
//       <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">Benchmark comparison</p>
//       <div className="grid grid-cols-2 gap-3">
//         <div className="rounded-md border border-slate-200 p-4 text-center">
//           <p className="text-[12px] text-slate-500">Current per employee</p>
//           <p className="mt-2 text-[22px] font-bold text-slate-950">{formatMoney(currentPerEmployee)}<span className="text-[14px] font-normal text-slate-500"> /mo</span></p>
//         </div>
//         <div className="rounded-md border border-slate-200 p-4 text-center">
//           <p className="text-[12px] text-slate-500">Optimized per employee</p>
//           <p className="mt-2 text-[22px] font-bold text-slate-950">{formatMoney(optimizedPerEmployee)}<span className="text-[14px] font-normal text-slate-500"> /mo</span></p>
//         </div>
//       </div>
//       <div className="mt-3 rounded-md border border-green-100 bg-green-50 px-3 py-2 text-[13px] font-medium text-green-700">
//         {comparison > 0
//           ? `The recommended stack lowers per-employee spend by ${comparison}%.`
//           : "Your per-employee spend is already well aligned."}
//       </div>
//     </DashboardCard>
//   );
// }

function TopRecommendationCard({ result, index }: { result: AuditResult; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cfg = REC_CONFIG[result.recommendation];
  const hasSavings = result.monthlySavings > 0;
  const workflows = result.workflowOverlaps?.length ? result.workflowOverlaps : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
    >
      <div className="grid gap-4 px-4 py-4 md:grid-cols-[260px_1fr_1fr_120px_120px_36px] md:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <ToolMark result={result} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-slate-950">{result.toolName}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-medium text-slate-500">{result.currentPlan}</span>
            </div>
            {workflows.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {workflows.slice(0, 2).map((workflow) => (
                  <span key={workflow} className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium capitalize text-green-700">
                    {workflow}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-[12px] text-slate-500">Current spend</p>
          <p className="mt-1 text-[20px] font-bold text-slate-950">
            {formatMoney(result.currentMonthlyCost)}<span className="text-[13px] font-normal text-slate-500">/mo</span>
          </p>
        </div>

        <div>
          <p className="text-[12px] text-slate-500">Optimized spend</p>
          <p className="mt-1 text-[20px] font-bold text-green-700">
            {formatMoney(result.projectedMonthlyCost)}<span className="text-[13px] font-normal text-green-700">/mo</span>
          </p>
        </div>

        <div className={`rounded-md px-4 py-3 `}>
          <p className="text-[12px] text-slate-600">Save</p>
          <p className={`mt-1 text-[18px] font-bold ${hasSavings ? "text-green-700" : "text-slate-950"}`}>
            {formatMoney(result.monthlySavings)}<span className="text-[13px] font-normal">/mo</span>
          </p>
          <p className="text-[11px] text-slate-500">{formatMoney(result.annualSavings)}/year</p>
        </div>

        <div className="flex md:justify-center">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          aria-label={expanded ? "Hide recommendation reasoning" : "Show recommendation reasoning"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-4 rounded-md bg-slate-50 px-4 py-3">
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-2">
                  <p className="text-[15px] font-bold text-slate-950">{result.recommendedAction}</p>
                  <p className="text-[15px] leading-relaxed text-slate-600">{result.reasoning}</p>
                  {result.conditions && result.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.conditions.map((condition) => (
                        <span key={condition} className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[12px] text-amber-700">
                          {condition}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


function CredexCTA({ totalMonthly }: { totalMonthly: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="relative overflow-hidden rounded-lg bg-linear-to-br from-green-800 via-green-700 to-emerald-800 p-8 text-white shadow-[0_18px_45px_rgba(20,83,45,0.22)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-green-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />

      <div className="relative">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-green-200">
          <Zap className="h-3 w-3" /> Maximize your savings
        </div>

        <h3 className="mt-4 text-[28px] font-bold leading-tight text-white">
          Capture even more than{" "}
          <span className="text-green-300">
            {formatMoney(totalMonthly)}/mo
          </span>
        </h3>

        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-green-100/85">
          Credex helps companies negotiate enterprise credits and vendor discounts
          on top of these optimizations, typically unlocking an extra 15-30% off
          your AI bill.
        </p>

        <a
          href="https://credex.rocks/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-[14px] font-semibold text-green-800 shadow-lg shadow-black/20 transition hover:bg-green-50 active:scale-[0.98]"
        >
          Talk to Credex <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}


function OptimalCTA() {
  return (
    <DashboardCard className="border-green-100 bg-green-50/70 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <Check className="h-6 w-6 text-green-700" />
      </div>
      <h3 className="text-[22px] font-bold text-slate-950">You&apos;re spending well.</h3>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-slate-600">
        No obvious savings found for your current stack. We&apos;ll notify you when new optimizations apply.
      </p>
    </DashboardCard>
  );
}

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
    `Just ran a free AI stack audit on SpendLens - found real savings in under 2 minutes. Try yours:\n${url}`
  );

  return (
    <DashboardCard className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700">
          <Share2 className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-950">Share this audit</p>
          <p className="mt-1 text-[14px] text-slate-500">
            Know someone overpaying for AI tools? Send them this link. It&apos;s public and anonymous.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-1.5 sm:flex-row">
        <input
          readOnly
          value={url}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13px] text-slate-500 outline-none"
        />
        <button
          onClick={copy}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-green-700"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy link
            </>
          )}
        </button>
      </div>
      <a
        href={`https://twitter.com/intent/tweet?text=${tweetText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 transition hover:text-slate-950"
      >
        <Share2 className="h-3.5 w-3.5" />
        Post on X / Twitter
      </a>
    </DashboardCard>
  );
}

export default function AuditResultsView({ audit }: AuditResultsViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const summary = audit.audit_result;
  const totalMonthly = Math.round(summary.totalMonthlySavings);
  const totalAnnual = Math.round(summary.totalAnnualSavings);
  const hasSavings = totalMonthly > 0;
  const hasHighSavings = summary.hasHighSavings;
  // const opportunities = summary.results.filter((result) => result.recommendation !== "optimal").length;
  const currentSpend = useMemo(
    () => summary.results.reduce((total, result) => total + result.currentMonthlyCost, 0),
    [summary.results]
  );
  // const projectedSpend = useMemo(
  //   () => summary.results.reduce((total, result) => total + result.projectedMonthlyCost, 0),
  //   [summary.results]
  // );
  const reduction = currentSpend > 0 ? Math.round((totalMonthly / currentSpend) * 100) : 0;
  const sortedResults = useMemo(
    () => [...summary.results].sort((a, b) => b.monthlySavings - a.monthlySavings),
    [summary.results]
  );
  const isAlreadyOptimal =
    !hasSavings || (totalMonthly < 100 && summary.results.every((result) => result.recommendation === "optimal"));

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const auditUrl = `${baseUrl}/audit/${audit.share_token}`;

  function copyLink() {
    navigator.clipboard.writeText(auditUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadPdf() {
    window.print();
  }

  function startFresh() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("spendlens-v3-audit-form");
    }
    router.push("/start");
  }

  function editAudit() {
    if (typeof window !== "undefined" && audit.tools_input) {
      // Restore the form state from the audit data
      const formData = {
        tools: audit.tools_input,
        teamSize: audit.team_size,
        // orgType and growthTrajectory are not in the raw tools_input but in the audit_result
        orgType: summary.orgType,
        growthTrajectory: summary.growthTrajectory
      };
      localStorage.setItem("spendlens-v3-audit-form", JSON.stringify(formData));
    }
    router.push("/start");
  }

  // Handle sticky bar visibility
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <Image src="/logo.png" alt="SpendLens" width={24} height={24} className="h-auto w-auto" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-bold tracking-normal text-slate-950">Spend<span className="text-green-600">Lens</span></h1>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={editAudit}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" /> Edit audit
            </button>
            <button
              onClick={startFresh}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              New audit
            </button>
            <button
              onClick={copyLink}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied" : "Share"}
            </button>
            <button
              onClick={downloadPdf}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-green-600 px-4 text-[14px] font-semibold text-white transition hover:bg-green-700"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 px-5 py-7 lg:grid-cols-[1fr_460px] lg:px-8">
        <div className="space-y-4">
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.82fr]">
            <DashboardCard className="p-6">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500">Total potential savings</p>
              <div className="mt-7">
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="text-[20px] font-medium text-slate-400 line-through decoration-slate-300 decoration-2">
                    {formatMoney(currentSpend * 12)}
                  </p>
                  <p className="text-[56px] font-bold leading-none text-green-600">
                    {formatMoney(currentSpend * 12 - totalAnnual)}
                    <span className="ml-2 align-baseline text-[18px] font-medium text-slate-700">/year</span>
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-green-700">
                  <TrendingDown className="h-5 w-5" />
                  <p className="text-[18px] font-bold">{reduction}% reduction</p>
                </div>
                <p className="mt-6 max-w-sm text-[16px] font-semibold text-slate-900">
                  Follow our recommendation to get this saving.
                </p>
                <p className="mt-1 text-[15px] text-slate-500">
                  That&apos;s {formatMoney(totalMonthly)}/month back in your pocket.
                </p>
              </div>
            </DashboardCard>
            {/* here */}
            <SpendDonut results={summary.results} totalSpend={currentSpend} />

            {/* <MetricGrid summary={summary} totalMonthly={totalMonthly} /> */}
          </div>

          <section id="recommendations">
            <SectionTitle>Top recommendations</SectionTitle>
            <div className="space-y-3">
              {sortedResults.map((result, index) => (
                <TopRecommendationCard key={`${result.toolName}-${index}`} result={result} index={index} />
              ))}
            </div>
          </section>

          {/* <StackInsights insights={summary.insights ?? []} /> */}

          {/* {hasHighSavings && <CredexCTA totalMonthly={totalMonthly} />} */}


          <AnimatePresence>
            {showFormModal && (
              <motion.div
                key="form-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed h-full inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
                onClick={(e) => { if (e.target === e.currentTarget) setShowFormModal(false); }}
              >
                <motion.div
                  key="form-modal-panel"
                  initial={{ opacity: 0, scale: 0.96, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 16 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <p className="font-semibold text-slate-950">{isAlreadyOptimal ? "Stay updated" : "Get your report"}</p>
                    <button
                      type="button"
                      onClick={() => setShowFormModal(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Close"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                  <div className="p-6">
                    {isAlreadyOptimal && <OptimalCTA />}
                    <LeadCaptureForm
                      shareToken={audit.share_token}
                      hasHighSavings={hasHighSavings}
                      totalMonthlySavings={summary.totalMonthlySavings}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <ShareStrip shareToken={audit.share_token} />


        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section>
            <SectionTitle>AI summary</SectionTitle>
            <AISummaryCard auditSummary={summary} />
          </section>
          <DashboardCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-950">Need the full report?</p>
                <p className="text-[14px] text-slate-500">Send it to your inbox below, including every recommendation.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFormModal(true)}
              className="mt-4 inline-flex h-10 px-8 items-center justify-center  rounded-xl border border-slate-200 text-[14px] bg-green-500 text-white font-semibold transition hover:bg-green-600"
            >
              Get your report <ArrowRight className="h-4 w-4 hover:translate-x-1 transition-all" />
            </button>
          </DashboardCard>
          <CredexCTA totalMonthly={totalMonthly} />
        </aside>
      </main>

      {/* Sticky Pill */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-4 rounded-full border border-green-100 bg-white px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Savings</span>
                <span className="text-[20px] font-bold text-green-600">{formatMoney(totalAnnual)}/yr</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <button
                onClick={() => {
                  const el = document.getElementById("recommendations");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-full bg-green-600 px-5 py-2 text-[13px] font-bold text-white transition hover:bg-green-700"
              >
                View Recommendations
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
