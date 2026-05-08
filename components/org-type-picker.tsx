"use client";

import { OrgType } from "@/types/audit";

interface OrgOption {
  value: OrgType;
  label: string;
  emoji: string;
  description: string;
}

const ORG_OPTIONS: OrgOption[] = [
  { value: "saas",      label: "SaaS Startup",    emoji: "🚀", description: "Building a software product" },
  { value: "agency",    label: "Agency",           emoji: "🎨", description: "Client work & deliverables" },
  { value: "internal",  label: "Internal Tools",   emoji: "⚙️", description: "Engineering & ops team" },
  { value: "research",  label: "Research Team",    emoji: "🔬", description: "Academic or R&D focused" },
  { value: "marketing", label: "Marketing Team",   emoji: "📣", description: "Content, campaigns & growth" },
  { value: "mixed",     label: "Mixed Team",       emoji: "🤝", description: "Cross-functional setup" },
];

interface OrgTypePickerProps {
  value: OrgType;
  onChange: (value: OrgType) => void;
}

export default function OrgTypePicker({ value, onChange }: OrgTypePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Organisation type"
      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
    >
      {ORG_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            id={`org-${opt.value}`}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              "relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              selected
                ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50",
            ].join(" ")}
          >
            <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
            <span className={`text-sm font-semibold ${selected ? "text-emerald-700" : "text-gray-800"}`}>
              {opt.label}
            </span>
            <span className="text-xs text-gray-400 leading-tight">{opt.description}</span>

            {/* Selected dot */}
            {selected && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
