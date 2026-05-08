"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ToolEntry } from "@/hooks/use-audit-form";
import { ToolName, WorkflowTag } from "@/types/audit";
import { PRICING_DATA } from "@/lib/pricing-data";

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

const TOOL_COLORS: Record<ToolName, string> = {
  Cursor:           "bg-blue-100 text-blue-700",
  "GitHub Copilot": "bg-slate-100 text-slate-700",
  Claude:           "bg-orange-100 text-orange-700",
  ChatGPT:          "bg-green-100 text-green-700",
  Gemini:           "bg-purple-100 text-purple-700",
  Windsurf:         "bg-cyan-100 text-cyan-700",
  "Anthropic API":  "bg-amber-100 text-amber-700",
  "OpenAI API":     "bg-emerald-100 text-emerald-700",
};

const TOOL_INITIALS: Record<ToolName, string> = {
  Cursor:           "Cu",
  "GitHub Copilot": "GH",
  Claude:           "Cl",
  ChatGPT:          "GP",
  Gemini:           "Ge",
  Windsurf:         "WS",
  "Anthropic API":  "An",
  "OpenAI API":     "OA",
};

const WORKFLOW_TAGS: { value: WorkflowTag; label: string; emoji: string }[] = [
  { value: "writing",      label: "Writing & docs",     emoji: "✍️" },
  { value: "coding",       label: "Coding",             emoji: "💻" },
  { value: "data",         label: "Data & analysis",    emoji: "📊" },
  { value: "research",     label: "Research",           emoji: "🔍" },
  { value: "support",      label: "Customer support",   emoji: "💬" },
  { value: "meetings",     label: "Meetings",           emoji: "🎙️" },
  { value: "design",       label: "Design",             emoji: "🎨" },
  { value: "brainstorming",label: "Brainstorming",      emoji: "💡" },
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

// ─── Collapsed view ───────────────────────────────────────────────────────────

function CollapsedCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ToolEntry;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const isApi = IS_API_TOOL(entry.toolName);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${TOOL_COLORS[entry.toolName]}`}
          aria-hidden="true"
        >
          {TOOL_INITIALS[entry.toolName]}
        </div>

        {/* Name + plan details */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{entry.toolName}</p>
          <p className="text-xs text-gray-400 truncate">
            {isApi
              ? `API — $${entry.monthlySpend}/mo`
              : `${entry.plan} · ${entry.seats} seat${entry.seats !== 1 ? "s" : ""} · $${entry.monthlySpend}/mo`}
          </p>
          {entry.workflows.length > 0 && (
            <p className="text-xs text-emerald-600 truncate mt-0.5">
              {entry.workflows.map(
                (w) => WORKFLOW_TAGS.find((t) => t.value === w)?.emoji ?? ""
              ).join(" ")} {entry.workflows.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          aria-label={`Edit ${entry.toolName}`}
          className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          aria-label={`Remove ${entry.toolName}`}
          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Expanded / edit view ─────────────────────────────────────────────────────

function ExpandedCard({
  entry,
  onUpdate,
  onSetSpend,
  onToggleWorkflow,
  onRemove,
  onConfirm,
}: ToolCardProps) {
  const plans = PRICING_DATA[entry.toolName];
  const isApi = IS_API_TOOL(entry.toolName);

  const handleToolChange = (toolName: ToolName) => {
    const newPlans = PRICING_DATA[toolName];
    const defaultPlan = newPlans[1] ?? newPlans[0];
    onUpdate({ toolName, plan: defaultPlan.name, seats: entry.seats, workflows: entry.workflows });
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Tool selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Tool
        </label>
        <select
          value={entry.toolName}
          onChange={(e) => handleToolChange(e.target.value as ToolName)}
          className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          aria-label="Select tool"
        >
          {TOOL_NAMES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Row 2: Plan + Seats inline */}
      {!isApi ? (
        <div className="grid grid-cols-2 gap-3">
          {/* Plan */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Plan
            </label>
            <select
              value={entry.plan}
              onChange={(e) => onUpdate({ plan: e.target.value })}
              className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
              aria-label={`Select plan for ${entry.toolName}`}
            >
              {plans.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} — ${p.pricePerUserMonth}/user
                </option>
              ))}
            </select>
          </div>

          {/* Seats + auto-cost */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Seats
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={999}
                value={entry.seats}
                onChange={(e) =>
                  onUpdate({ seats: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-full h-10 rounded-xl border border-gray-200 bg-white pl-3 pr-14 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                aria-label={`Seats for ${entry.toolName}`}
              />
              {/* Estimated cost overlay */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 pointer-events-none">
                ${entry.monthlySpend}/mo
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* API tools: manual spend input */
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Monthly API spend ($)
          </label>
          <input
            type="number"
            min={0}
            value={entry.monthlySpend}
            onChange={(e) => onSetSpend(parseFloat(e.target.value) || 0)}
            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            aria-label="Monthly API spend"
          />
        </div>
      )}

      {/* Row 3: Workflow tags */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Used for
          <span className="ml-1 normal-case text-gray-400">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Workflow tags">
          {WORKFLOW_TAGS.map(({ value, label, emoji }) => {
            const active = entry.workflows.includes(value);
            return (
              <button
                key={value}
                onClick={() => onToggleWorkflow(value)}
                aria-pressed={active}
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700",
                ].join(" ")}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          onClick={onRemove}
          className="text-sm text-red-400 hover:text-red-600 transition-colors focus-visible:outline-none"
          aria-label={`Remove ${entry.toolName}`}
        >
          Remove
        </button>
        <button
          id={`confirm-tool-${entry.id}`}
          onClick={onConfirm}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Done ✓
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
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <motion.div layout className="p-4">
        <AnimatePresence mode="wait" initial={false}>
          {entry.isEditing ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
    </motion.div>
  );
}
