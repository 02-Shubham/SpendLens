"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StickySummaryBarProps {
  toolCount: number;
  totalMonthlySpend: number;
  onRunAudit: () => void;
  disabled: boolean;
}

export default function StickySummaryBar({
  toolCount,
  totalMonthlySpend,
  onRunAudit,
  disabled,
}: StickySummaryBarProps) {
  return (
    <AnimatePresence>
      {toolCount > 0 && (
        <motion.div
          key="summary-bar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          aria-label="Audit summary"
        >
          {/* Frosted blur backdrop */}
          <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              {/* Summary text */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 leading-tight">
                    {toolCount} tool{toolCount !== 1 ? "s" : ""} added
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={totalMonthlySpend}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="text-lg font-bold text-gray-900"
                    >
                      ${totalMonthlySpend.toFixed(0)}
                      <span className="text-sm font-normal text-gray-500">/mo est.</span>
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* CTA */}
              <button
                id="sticky-run-audit"
                onClick={onRunAudit}
                disabled={disabled}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shadow-md"
              >
                Review & Run Audit →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
