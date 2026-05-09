"use client";

import { OrgType } from "@/types/audit";
import { Check } from "lucide-react";

interface OrgOption {
  value: OrgType;
  label: string;
  emoji: string;
}

const ORG_OPTIONS: OrgOption[] = [
  { value: "saas",      label: "Coding & dev",     emoji: "💻" },
  { value: "marketing", label: "Writing & content", emoji: "✍️" },
  { value: "internal",  label: "Data & analysis",  emoji: "📊" },
  { value: "mixed",     label: "Mixed / other",     emoji: "🔀" },
];

interface OrgTypePickerProps {
  value: OrgType;
  onChange: (value: OrgType) => void;
}

export default function OrgTypePicker({ value, onChange }: OrgTypePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Team use case"
      className="grid grid-cols-2 gap-3"
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
            className={`
              relative flex flex-col items-center justify-center gap-3 rounded-md border p-4 text-center transition-all duration-200
              ${selected 
                ? "border-green-500 bg-green-50" 
                : "border-border bg-surface hover:border-border-strong"}
            `}
          >
            <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
            <span className={`text-[14px] font-medium ${selected ? "text-green-700" : "text-text"}`}>
              {opt.label}
            </span>

            {/* Selected checkmark */}
            {selected && (
              <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
