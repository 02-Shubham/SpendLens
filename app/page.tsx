"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditForm } from "@/hooks/use-audit-form";
import { WorkflowTag, ToolName, OrgType } from "@/types/audit";
import OrgTypePicker from "@/components/org-type-picker";
import ToolCard from "@/components/tool-card";
import { Plus, Minus, ArrowRight, Loader2 } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ORG_LABELS: Record<OrgType, string> = {
  saas:      "Coding & dev",
  marketing: "Writing & content",
  internal:  "Data & analysis",
  mixed:     "Mixed / other",
  // These are for backward compatibility if any old data exists
  agency:    "Mixed / other",
  research:  "Mixed / other",
};

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
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SpendLens" width={35} height={35} />
          <span className="font-serif font-bold text-[20px] text-text-primary">
            SpendLens
          </span>
        </div>
        <span className="text-[13px] text-green-500">
          No login required
        </span>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative mx-auto mt-16 mb-12 max-w-[640px] text-center px-6">
     
      <div className="inline-flex items-center rounded-full border border-green-300 bg-green-50 px-3 py-1 text-[14px] font-medium text-green-600 mb-4">
        Free AI spend audit
      </div>
      <h1 className="font-serif text-[48px] text-text-primary mb-4">
        Find out exactly how much you&apos;re <i className="font-serif italic text-green-500">overspending</i> on AI tools
      </h1>
      <p className="mx-auto max-w-[480px] text-[18px] text-gray-600 mb-8">
        2-minute audit for teams using Cursor, Copilot, Claude, or ChatGPT. Free, no login, instant results.
      </p>
      
      <div className="mx-auto max-w-[460px] flex items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-5 py-2.5 text-[13px] text-text-tertiary">
        <span className="text-gray-600">Teams save an average of</span>
        <span className="font-medium text-green-500">$340/month</span>
        <span className="text-gray-600">That&apos;s </span>
        <span className="font-medium text-green-500">$4,080/year</span>
      </div>
    </section>
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
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#c0c1c2_1px,transparent_1px)] bg-size-[24px_24px]" />
      <Navbar />
      
      {state.step === 1 && <Hero />}

      <main className={`mx-auto max-w-[560px] px-6 ${state.step === 1 ? "pb-32" : "pt-16 pb-32"}`}>
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-8 shadow-( --shadow-md )">
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
                <div>
                  <h2 className="text-[20px] font-semibold text-text-primary">
                    First, tell us about your team
                  </h2>
                </div>

                {/* Team size stepper */}
                <div className="space-y-3 text-center py-4">
                  <div className="flex items-center justify-center gap-6">
                    <button 
                      onClick={() => setTeamSize(Math.max(1, state.teamSize - 1))}
                      className="stepper-button w-12 h-12"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="font-mono text-[48px] font-medium min-w-[3ch]">
                      {state.teamSize}
                    </span>
                    <button 
                      onClick={() => setTeamSize(state.teamSize + 1)}
                      className="stepper-button w-12 h-12"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-[14px] text-text-tertiary uppercase tracking-wider">
                    people on your team
                  </p>
                </div>

                {/* Use case grid */}
                <div className="space-y-3">
                  <OrgTypePicker
                    value={state.orgType}
                    onChange={setOrgType}
                  />
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
                        <th className="px-4 py-3 font-medium text-text-secondary">Tool</th>
                        <th className="px-4 py-3 font-medium text-text-secondary">Seats</th>
                        <th className="px-4 py-3 font-medium text-text-secondary text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {state.tools.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium text-text-primary">{entry.toolName}</div>
                            <div className="text-[12px] text-text-tertiary">{entry.plan}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-text-secondary">{entry.seats}</td>
                          <td className="px-4 py-3 font-mono text-right text-text-primary">${entry.monthlySpend}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-surface-2 font-semibold border-t border-border">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-text-primary">Total</td>
                        <td className="px-4 py-3 font-mono text-right text-green-600 text-[16px]">
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
                    className="flex-2 h-12 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 text-white font-medium rounded-md transition-all shadow-(--shadow-sm)"
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
        <div className="fixed bottom-0 left-0 w-full bg-surface-2 border-t border-border p-3 shadow-(--shadow-lg)">
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
