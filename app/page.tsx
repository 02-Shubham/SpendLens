"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditForm, TOOL_NAMES } from "@/hooks/use-audit-form";
import { WorkflowTag, ToolName, OrgType } from "@/types/audit";
import OrgTypePicker from "@/components/org-type-picker";
import ToolCard from "@/components/tool-card";
import StickySummaryBar from "@/components/sticky-summary-bar";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORG_LABELS: Record<OrgType, string> = {
  saas:      "SaaS Startup",
  agency:    "Agency",
  internal:  "Internal Tools",
  research:  "Research Team",
  marketing: "Marketing Team",
  mixed:     "Mixed Team",
};

const QUICK_SIZES = [5, 10, 25, 50];

// ─── Step animation variants ──────────────────────────────────────────────────

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -24 },
};

// ─── Reusable step header ─────────────────────────────────────────────────────

function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
        Step {step} of 3
      </p>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8" role="list" aria-label="Progress">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2" role="listitem">
          <div
            className={[
              "w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200",
              s === current
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : s < current
                ? "bg-emerald-100 text-emerald-600"
                : "bg-gray-100 text-gray-400",
            ].join(" ")}
            aria-current={s === current ? "step" : undefined}
          >
            {s < current ? "✓" : s}
          </div>
          {s < 3 && (
            <div
              className={`w-16 h-0.5 rounded-full transition-colors duration-300 ${s < current ? "bg-emerald-400" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const {
    state,
    hydrated,
    totalMonthlySpend,
    setStep,
    setTeamSize,
    setOrgType,
    addTool,
    removeTool,
    updateTool,
    setToolSpend,
    toggleWorkflow,
    getToolsPayload,
  } = useAuditForm();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceedToStep2 = state.teamSize >= 1;
  const canProceedToStep3 = state.tools.length > 0;

  async function handleSubmit() {
    const tools = getToolsPayload();
    if (tools.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools,
          teamSize: state.teamSize,
          orgType: state.orgType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/audit/${data.shareToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run audit");
      setSubmitting(false);
    }
  }

  // Avoid SSR/localStorage hydration flicker
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Nav ── */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="font-bold text-gray-900">SpendLens</span>
          </div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            AI Spend Audit
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10 pb-32">
        {/* ── Hero (only on step 1) ── */}
        <AnimatePresence>
          {state.step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-10"
            >
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                How much are you{" "}
                <span className="text-emerald-600">overpaying</span>{" "}
                for AI tools?
              </h1>
              <p className="mt-3 text-gray-500 text-lg">
                Under 1 minute. No account needed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <StepIndicator current={state.step} />

        {/* ── Steps ── */}
        <AnimatePresence mode="wait">

          {/* ────────── STEP 1 — Team Basics ────────── */}
          {state.step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-7">
                <StepHeader
                  step={1}
                  title="Tell us about your team"
                  subtitle="We'll use this to personalise your audit results."
                />

                {/* Team size */}
                <div className="space-y-3">
                  <label
                    htmlFor="team-size-range"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Total team size
                  </label>

                  {/* Slider */}
                  <div className="flex items-center gap-4">
                    <input
                      id="team-size-range"
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={state.teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value))}
                      className="flex-1 accent-emerald-600 h-2 cursor-pointer"
                      aria-label="Team size slider"
                    />
                    <span className="w-16 text-center text-xl font-bold text-emerald-600 tabular-nums">
                      {state.teamSize}
                    </span>
                  </div>

                  {/* Quick picks */}
                  <div className="flex gap-2">
                    {QUICK_SIZES.map((n) => (
                      <button
                        key={n}
                        onClick={() => setTeamSize(n)}
                        className={[
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          state.teamSize === n
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300",
                        ].join(" ")}
                      >
                        {n === 50 ? "50+" : n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Org type */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Organisation type
                  </p>
                  <OrgTypePicker
                    value={state.orgType}
                    onChange={setOrgType}
                  />
                </div>

                {/* CTA */}
                <button
                  id="step1-next"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shadow-md shadow-emerald-100"
                >
                  Next — Add your tools →
                </button>
              </div>
            </motion.div>
          )}

          {/* ────────── STEP 2 — Add Tools ────────── */}
          {state.step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="space-y-4">
                <StepHeader
                  step={2}
                  title="Add your AI tools"
                  subtitle="Select the tools your team uses. Tag what each tool is used for."
                />

                {/* Tool list */}
                <AnimatePresence>
                  {state.tools.map((entry) => (
                    <ToolCard
                      key={entry.id}
                      entry={entry}
                      onUpdate={(patch) => updateTool(entry.id, patch)}
                      onSetSpend={(spend) => setToolSpend(entry.id, spend)}
                      onToggleWorkflow={(tag: WorkflowTag) =>
                        toggleWorkflow(entry.id, tag)
                      }
                      onRemove={() => removeTool(entry.id)}
                      onConfirm={() =>
                        updateTool(entry.id, { isEditing: false })
                      }
                    />
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {state.tools.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center"
                  >
                    <p className="text-3xl mb-3" aria-hidden="true">🛠️</p>
                    <p className="text-sm font-medium text-gray-500">
                      No tools added yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click below to add your first tool
                    </p>
                  </motion.div>
                )}

                {/* Add tool button */}
                <button
                  id="add-tool"
                  onClick={() => addTool("ChatGPT" as ToolName)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-emerald-300 rounded-2xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <span className="text-lg" aria-hidden="true">+</span>
                  Add a tool
                </button>

                {/* Back */}
                <button
                  onClick={() => setStep(1)}
                  className="w-full border border-gray-200 text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* ────────── STEP 3 — Review & Run ────────── */}
          {state.step === 3 && (
            <motion.div
              key="step-3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                <StepHeader
                  step={3}
                  title="Review your audit"
                  subtitle="Confirm everything looks right before we run your analysis."
                />

                {/* Context pills */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Team size", value: `${state.teamSize} people` },
                    { label: "Org type", value: ORG_LABELS[state.orgType] },
                    { label: "Tools", value: `${state.tools.length} added` },
                    { label: "Est. spend", value: `$${totalMonthlySpend}/mo` },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center"
                    >
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Tool list */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Tools & workflows
                  </p>
                  {state.tools.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-3 py-2.5 px-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {entry.toolName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {entry.plan} · {entry.seats} seat{entry.seats !== 1 ? "s" : ""}
                        </p>
                        {entry.workflows.length > 0 && (
                          <p className="text-xs text-emerald-600 mt-0.5">
                            {entry.workflows.join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-900 shrink-0">
                        ${entry.monthlySpend}/mo
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Total monthly</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    ${totalMonthlySpend.toFixed(0)}
                    <span className="text-base font-normal text-gray-400">/mo</span>
                  </span>
                </div>

                {/* Detected workflows summary */}
                {(() => {
                  const allWorkflows = [
                    ...new Set(state.tools.flatMap((t) => t.workflows)),
                  ];
                  if (allWorkflows.length === 0) return null;
                  return (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-xs font-semibold text-emerald-700 mb-2">
                        🔍 Workflows detected across your stack
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {allWorkflows.map((w) => (
                          <span
                            key={w}
                            className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-200 text-gray-500 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    ← Edit tools
                  </button>
                  <button
                    id="run-audit"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md shadow-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Running audit…
                      </span>
                    ) : (
                      "Generate Spend Audit →"
                    )}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400">
                  No account needed · Your data is never sold
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Sticky bottom bar (Step 2 only) ── */}
      {state.step === 2 && (
        <StickySummaryBar
          toolCount={state.tools.length}
          totalMonthlySpend={totalMonthlySpend}
          onRunAudit={() => setStep(3)}
          disabled={!canProceedToStep3}
        />
      )}
    </div>
  );
}
