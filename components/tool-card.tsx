"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolEntry } from "@/hooks/use-audit-form";
import { ToolName, WorkflowTag } from "@/types/audit";
import { PRICING_DATA } from "@/lib/pricing-data";
import { ChevronDown, Plus, Minus, Trash2, Edit2, Check } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const TOOL_NAMES: ToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Gemini",
  "Windsurf",
  "Anthropic API",
  "OpenAI API",
];

const WORKFLOW_TAGS: { value: WorkflowTag; label: string }[] = [
  { value: "coding",        label: "Coding" },
  { value: "writing",       label: "Writing" },
  { value: "research",      label: "Research" },
  { value: "data",          label: "Data" },
  { value: "support",       label: "Support" },
  { value: "brainstorming", label: "Other" },
];

const INTENSITY_OPTIONS: { value: "light" | "moderate" | "heavy"; label: string }[] = [
  { value: "light",    label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "heavy",    label: "Heavy" },
];

// Shared pill style helper
const pillClass = (active: boolean) =>
  `px-[14px] py-[6px] rounded-[6px] text-[13px] font-medium border transition-all duration-150 cursor-pointer select-none
   ${active
     ? "bg-green-100 border-green-400 text-green-700"
     : "bg-white border-border text-text-secondary hover:border-green-500"}`;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ToolCardProps {
  entry: ToolEntry;
  onUpdate: (patch: Partial<Omit<ToolEntry, "id" | "monthlySpend">>) => void;
  onSetSpend: (spend: number) => void;
  onToggleWorkflow: (tag: WorkflowTag) => void;
  onRemove: () => void;
  onConfirm: () => void;
}

// ─── Collapsed view ────────────────────────────────────────────────────────────

function CollapsedCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ToolEntry;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-[14px] font-medium text-text-primary shrink-0">
          {entry.toolName}
        </span>
        <span className="px-2 py-0.5 bg-surface-2 text-text-tertiary text-[11px] font-medium rounded-full uppercase tracking-wider shrink-0">
          {entry.plan}
        </span>
        <div className="flex gap-1 overflow-hidden">
          {entry.workflows.slice(0, 3).map((w) => (
            <span key={w} className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-[4px] shrink-0">
              {WORKFLOW_TAGS.find(t => t.value === w)?.label || w}
            </span>
          ))}
          {entry.workflows.length > 3 && (
            <span className="text-[11px] text-text-tertiary">+{entry.workflows.length - 3}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="font-mono text-[16px] text-green-600 font-medium">
          ${entry.monthlySpend}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-text-tertiary hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Expanded / edit view ──────────────────────────────────────────────────────

function ExpandedCard({
  entry,
  onUpdate,
  onSetSpend,
  onToggleWorkflow,
  onRemove,
  onConfirm,
}: ToolCardProps) {
  const [showWorkflowError, setShowWorkflowError] = useState(false);
  const plans = PRICING_DATA[entry.toolName];
  const isApiTool = entry.toolName === "Anthropic API" || entry.toolName === "OpenAI API";
  const currentPlan = plans.find(p => p.name === entry.plan);

  const handleToolChange = (toolName: ToolName) => {
    const newPlans = PRICING_DATA[toolName];
    const defaultPlan = newPlans[1] ?? newPlans[0];
    onUpdate({ toolName, plan: defaultPlan.name, seats: entry.seats, workflows: entry.workflows });
  };

  const handleConfirm = () => {
    if (entry.workflows.length === 0) {
      setShowWorkflowError(true);
      return;
    }
    setShowWorkflowError(false);
    onConfirm();
  };

  return (
    <div className="bg-surface border border-border-strong rounded-lg p-5 shadow-sm space-y-5 animate-slide-up">

      {/* Row 1: Tool + Plan selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <select
            value={entry.toolName}
            onChange={(e) => handleToolChange(e.target.value as ToolName)}
            className="w-full h-11 appearance-none rounded-md border border-border bg-surface px-3 pr-10 text-[15px] font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-green-500 transition-shadow"
          >
            {TOOL_NAMES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={entry.plan}
            onChange={(e) => onUpdate({ plan: e.target.value })}
            className="w-full h-11 appearance-none rounded-md border border-border bg-surface px-3 pr-10 text-[15px] text-text-primary focus:outline-none focus:ring-1 focus:ring-green-500 transition-shadow"
          >
            {plans.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Row 2: Seats stepper */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdate({ seats: Math.max(1, entry.seats - 1) })}
              className="stepper-button"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-mono text-[18px] font-medium min-w-[2ch] text-center">
              {entry.seats}
            </span>
            <button
              onClick={() => onUpdate({ seats: entry.seats + 1 })}
              className="stepper-button"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-[12px] text-text-tertiary">seats</span>
        </div>

        {/* Cost display */}
        {!isApiTool && (
          <div className="text-right">
            <div className="font-mono text-[16px] text-green-600 font-medium">
              ${entry.monthlySpend}/mo
            </div>
            <div className="text-[12px] text-text-tertiary">
              {entry.seats} × ${currentPlan?.pricePerUserMonth || 0}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Usage intensity pills */}
      <div className="space-y-2">
        <p className="text-[12px] text-text-tertiary uppercase tracking-wide">
          How intensely does your team use this?
        </p>
        <div className="flex gap-2">
          {INTENSITY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onUpdate({ usageIntensity: value })}
              className={pillClass(entry.usageIntensity === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 4: Months active (compact inline) */}
      <div className="flex items-center gap-3">
        <p className="text-[12px] text-text-tertiary shrink-0">
          How long have you had this subscription?
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={120}
            step={1}
            placeholder="12"
            value={entry.monthsActive ?? ""}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              onUpdate({ monthsActive: isNaN(v) ? undefined : Math.min(120, Math.max(1, v)) });
            }}
            className="w-[72px] h-8 rounded-md border border-border bg-surface px-2 text-[14px] text-text-primary text-center font-mono focus:outline-none focus:ring-1 focus:ring-green-500 transition-shadow"
          />
          <span className="text-[12px] text-text-tertiary">months</span>
        </div>
      </div>

      {/* Row 5: API spend manual input (only for API tools) */}
      {isApiTool && (
        <div className="flex items-center gap-3">
          <p className="text-[12px] text-text-tertiary shrink-0">Monthly API spend</p>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-text-tertiary">$</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={entry.monthlySpend || ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onSetSpend(isNaN(v) ? 0 : v);
              }}
              className="w-[88px] h-8 rounded-md border border-border bg-surface px-2 text-[14px] text-text-primary text-center font-mono focus:outline-none focus:ring-1 focus:ring-green-500 transition-shadow"
            />
            <span className="text-[12px] text-text-tertiary">/mo</span>
          </div>
        </div>
      )}

      {/* Row 6: Workflow tags */}
      <div className="space-y-2">
        <p className="text-[12px] text-text-tertiary uppercase tracking-wide">
          What do these seats use it for?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {WORKFLOW_TAGS.map(({ value, label }) => {
            const active = entry.workflows.includes(value);
            return (
              <button
                key={value}
                onClick={() => {
                  setShowWorkflowError(false);
                  onToggleWorkflow(value);
                }}
                className={pillClass(active)}
              >
                {active && <Check className="h-3.5 w-3.5 mr-1 inline-block" />}
                {label}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showWorkflowError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12px] text-red-600"
            >
              Select at least one workflow
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Row 7: Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          onClick={onRemove}
          className="px-4 py-2 text-[14px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-[14px] font-medium px-5 py-2 rounded-md transition-all shadow-sm"
        >
          Done <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ToolCard(props: ToolCardProps) {
  const { onUpdate, onRemove } = props;

  return (
    <motion.div layout className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {props.entry.isEditing ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <ExpandedCard {...props} />
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CollapsedCard
              entry={props.entry}
              onEdit={() => onUpdate({ isEditing: true })}
              onRemove={onRemove}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
