"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditForm } from "@/hooks/use-audit-form";
import { WorkflowTag, ToolName } from "@/types/audit";
import OrgTypePicker from "@/components/org-type-picker";
import ToolCard from "@/components/tool-card";
import { Plus, Minus, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ─── Step animation variants ──────────────────────────────────────────────────

const stepVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
  }),
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-[56px] border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[720px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="SpendLens" width={35} height={35} />
          <span className="font-serif font-bold text-[20px] text-text-primary">
            SpendLens
          </span>
        </Link>
        <span className="text-[13px] text-green-500">
          No login required
        </span>
      </div>
    </header>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StartAuditPage() {
  const router = useRouter();
  const {
    state,
    hydrated,
    totalMonthlySpend,
    setStep,
    setTeamSize,
    setOrgType,
    setGrowthTrajectory,
    addTool,
    removeTool,
    updateTool,
    setToolSpend,
    toggleWorkflow,
    getToolsPayload,
  } = useAuditForm();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const handleSetStep = (newStep: number) => {
    setDirection(newStep > state.step ? 1 : -1);
    setStep(newStep as 1 | 2 | 3);
  };

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
          growthTrajectory: state.growthTrajectory,
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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const progress = (state.step / 3) * 100;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      
      <main className="mx-auto max-w-[560px] px-6 pt-16 pb-32">
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-8 shadow-sm">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-[3px] w-full bg-border">
            <motion.div 
              className="h-full bg-green-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {/* ────────── STEP 1 — Team Basics ────────── */}
            {state.step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                   <Link href="/" className="text-text-tertiary hover:text-text-primary transition-colors">
                     <ArrowLeft className="h-4 w-4" />
                   </Link>
                  <h2 className="text-[20px] font-semibold text-text-primary">
                    Tell us about your team
                  </h2>
                </div>

                {/* Team size stepper */}
                <div className="space-y-3 text-center py-4">
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => setTeamSize(Math.max(1, state.teamSize - 1))}
                      className="stepper-button w-12 h-12 flex items-center justify-center rounded-full border border-border hover:bg-surface-2 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="font-mono text-[48px] font-medium min-w-[3ch]">
                      {state.teamSize}
                    </span>
                    <button 
                      onClick={() => setTeamSize(state.teamSize + 1)}
                      className="stepper-button w-12 h-12 flex items-center justify-center rounded-full border border-border hover:bg-surface-2 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-[14px] text-text-tertiary uppercase tracking-wider">
                    people on your team
                  </p>
                </div>

                {/* Org type picker */}
                <div className="space-y-3">
                  <OrgTypePicker
                    value={state.orgType}
                    onChange={setOrgType}
                  />
                </div>

                {/* Growth trajectory */}
                <div className="space-y-2">
                  <p className="text-[13px] uppercase tracking-wide text-text-tertiary">
                    Expected team growth
                  </p>
                  <div className="flex gap-2">
                    {([
                      { value: "stable",  label: "Stable" },
                      { value: "hiring",  label: "Hiring soon" },
                      { value: "scaling", label: "Scaling fast" },
                    ] as { value: "stable" | "hiring" | "scaling"; label: string }[]).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setGrowthTrajectory(value)}
                        className={`px-[14px] py-[6px] rounded-[6px] text-[13px] font-medium border transition-all duration-150 ${
                          state.growthTrajectory === value
                            ? "bg-green-100 border-green-400 text-green-700"
                            : "bg-white border-border text-text-secondary hover:border-green-500"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSetStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 text-white font-medium rounded-md transition-all"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {/* ────────── STEP 2 — Add Tools ────────── */}
            {state.step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-[20px] font-semibold text-text-primary">
                    Which AI tools does your team pay for?
                  </h2>
                  <p className="text-[14px] text-text-tertiary">
                    Add each tool. We&apos;ll calculate exact costs.
                  </p>
                </div>

                {/* Tool list */}
                <div className="space-y-1">
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
                </div>

                {/* Add tool button */}
                <button
                  onClick={() => addTool("ChatGPT" as ToolName)}
                  className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-green-500 rounded-md text-[14px] font-medium text-green-600 hover:bg-green-50 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add a tool
                </button>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleSetStep(1)}
                    className="flex-1 h-12 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => handleSetStep(3)}
                    disabled={!canProceedToStep3}
                  className="flex-2 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 text-white font-medium rounded-md transition-all"
                  >
                    Review audit <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ────────── STEP 3 — Review ────────── */}
            {state.step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-[20px] font-semibold text-text-primary">
                    Review your audit
                  </h2>
                  <p className="text-[14px] text-text-tertiary">
                    Confirm everything looks right before we run your analysis.
                  </p>
                </div>

                {/* Summary Table */}
                <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full text-left text-[14px]">
                    <thead className="bg-surface-2 border-b border-border">
                      <tr>
                        <th className="px-3 py-3 font-medium text-text-secondary">Tool</th>
                        <th className="px-3 py-3 font-medium text-text-secondary">Seats</th>
                        <th className="px-3 py-3 font-medium text-text-secondary">Workflows</th>
                        <th className="px-3 py-3 font-medium text-text-secondary text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {state.tools.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-3 py-3">
                            <div className="font-medium text-text-primary">{entry.toolName}</div>
                            <div className="text-[12px] text-text-tertiary">{entry.plan}</div>
                          </td>
                          <td className="px-3 py-3 font-mono text-text-secondary">{entry.seats}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {entry.workflows.length > 0 ? entry.workflows.map((w) => (
                                <span key={w} className="inline-flex items-center px-[6px] py-[2px] rounded-[4px] bg-green-50 border border-green-100 text-green-700 text-[11px] font-medium">
                                  {w.charAt(0).toUpperCase() + w.slice(1)}
                                </span>
                              )) : (
                                <span className="text-[12px] text-text-tertiary italic">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-right text-text-primary">${entry.monthlySpend}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-surface-2 font-semibold border-t border-border">
                      <tr>
                        <td colSpan={3} className="px-3 py-3 text-text-primary">Total</td>
                        <td className="px-3 py-3 font-mono text-right text-green-600 text-[16px]">
                          ${totalMonthlySpend.toFixed(0)}/mo
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {error && (
                  <p className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-md border border-red-100">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleSetStep(2)}
                    className="flex-1 h-12 text-[14px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ← Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-2 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 text-white font-medium rounded-md transition-all shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running audit...
                      </>
                    ) : (
                      <>Run my audit <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Running Total Footer (Sticky) */}
      {state.step === 2 && state.tools.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-surface-2 border-t border-border p-3 shadow-lg">
          <div className="mx-auto max-w-[560px] flex items-center justify-between px-4">
            <span className="text-[13px] text-text-tertiary">
              {state.tools.length} tool{state.tools.length !== 1 ? "s" : ""} added
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-text-secondary">Total:</span>
              <span className="font-mono text-[16px] font-medium text-text-primary">
                ${totalMonthlySpend}/mo
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
