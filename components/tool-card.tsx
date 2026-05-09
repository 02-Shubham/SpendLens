"use client";

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
  { value: "coding",       label: "Coding" },
  { value: "writing",      label: "Writing" },
  { value: "research",     label: "Research" },
  { value: "data",         label: "Data" },
  { value: "support",      label: "Support" },
  { value: "brainstorming",label: "Other" }, // Using brainstorming as Other to keep types
];

const IS_API_TOOL = (name: ToolName) =>
  name === "Anthropic API" || name === "OpenAI API";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ToolCardProps {
  entry: ToolEntry;
  onUpdate: (patch: Partial<Omit<ToolEntry, "id" | "monthlySpend">>) => void;
  onSetSpend: (spend: number) => void;
  onToggleWorkflow: (tag: WorkflowTag) => void;
  onRemove: () => void;
  onConfirm: () => void;
}

// ─── Collapsed view (Added tool row) ───────────────────────────────────────────

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
      <div className="flex items-center gap-3">
        <span className="text-[14px] font-medium text-text-primary">
          {entry.toolName}
        </span>
        <span className="px-2 py-0.5 bg-surface-2 text-text-tertiary text-[11px] font-medium rounded-full uppercase tracking-wider">
          {entry.plan}
        </span>
        <div className="flex gap-1">
          {entry.workflows.map((w) => (
            <span key={w} className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-full">
              {WORKFLOW_TAGS.find(t => t.value === w)?.label || w}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
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

// ─── Expanded / edit view (Tool card) ──────────────────────────────────────────

function ExpandedCard({
  entry,
  onUpdate,
  onToggleWorkflow,
  onRemove,
  onConfirm,
}: ToolCardProps) {
  const plans = PRICING_DATA[entry.toolName];

  const handleToolChange = (toolName: ToolName) => {
    const newPlans = PRICING_DATA[toolName];
    const defaultPlan = newPlans[1] ?? newPlans[0];
    onUpdate({ toolName, plan: defaultPlan.name, seats: entry.seats, workflows: entry.workflows });
  };

  return (
    <div className="bg-surface border border-border-strong rounded-lg p-5 shadow-(--shadow-sm) border-l-green-500 space-y-5 animate-slide-up">
      {/* Row 1: Tool selector + Plan selector */}
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
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Row 2: Seats stepper + cost display */}
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
          <span className="text-[12px] text-text-tertiary">people on your team</span>
        </div>

        <div className="text-right">
          <div className="font-mono text-[16px] text-green-600 font-medium">
            ${entry.monthlySpend}/mo
          </div>
          <div className="text-[12px] text-text-tertiary">
            {entry.seats} seats × ${plans.find(p => p.name === entry.plan)?.pricePerUserMonth || 0}
          </div>
        </div>
      </div>

      {/* Row 3: Tag selector */}
      <div className="space-y-2">
        <p className="text-[13px] font-medium text-text-secondary">Used for</p>
        <div className="flex flex-wrap gap-2">
          {WORKFLOW_TAGS.map(({ value, label }) => {
            const active = entry.workflows.includes(value);
            return (
              <button
                key={value}
                onClick={() => onToggleWorkflow(value)}
                className={`
                  px-3 py-1 rounded-full text-[12px] font-medium border transition-all
                  ${active 
                    ? "bg-green-100 border-green-400 text-green-700" 
                    : "bg-surface border-border text-text-secondary hover:border-border-strong"}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onRemove}
          className="px-4 py-2 text-[14px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-[14px] font-medium px-5 py-2 rounded-md transition-all shadow-(--shadow-sm)"
        >
          Add tool <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ToolCard(props: ToolCardProps) {
  const { entry, onUpdate, onRemove } = props;

  return (
    <motion.div
      layout
      className="w-full"
    >
      <AnimatePresence mode="wait" initial={false}>
        {entry.isEditing ? (
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
              entry={entry}
              onEdit={() => onUpdate({ isEditing: true })}
              onRemove={onRemove}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
