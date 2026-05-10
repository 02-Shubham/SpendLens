"use client";

import { OrgType } from "@/types/audit";
import { Check, Code2, PenLine, BarChart2, Layers } from "lucide-react";

interface OrgOption {
  value: OrgType;
  label: string;
  sublabel: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const ORG_OPTIONS: OrgOption[] = [
  { value: "saas",      label: "Coding",     sublabel: "Dev & engineering",   Icon: Code2 },
  { value: "marketing", label: "Writing",    sublabel: "Content & docs",       Icon: PenLine },
  { value: "internal",  label: "Data",       sublabel: "Analysis & research",  Icon: BarChart2 },
  { value: "mixed",     label: "Mixed",      sublabel: "Multiple use cases",   Icon: Layers },
];

interface OrgTypePickerProps {
  value: OrgType[];
  onChange: (value: OrgType[]) => void;
}

export default function OrgTypePicker({ value, onChange }: OrgTypePickerProps) {
  const toggle = (opt: OrgType) => {
    if (value.includes(opt)) {
      // Prevent deselecting the last item
      if (value.length === 1) return;
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div
      role="group"
      aria-label="Team use case"
      className="grid grid-cols-2 gap-3"
    >
      {ORG_OPTIONS.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            id={`org-${opt.value}`}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(opt.value)}
            className={`
              relative flex flex-col items-start gap-2 rounded-md border p-4 text-left transition-all duration-150
              ${selected
                ? "border-green-400 bg-green-50"
                : "border-border bg-surface hover:border-green-400"}
            `}
          >
            <opt.Icon
              className={`h-4 w-4 ${selected ? "text-green-600" : "text-text-tertiary"}`}
            />
            <div>
              <div className={`text-[14px] font-semibold ${selected ? "text-green-700" : "text-text-primary"}`}>
                {opt.label}
              </div>
              <div className="text-[12px] text-text-tertiary leading-tight">
                {opt.sublabel}
              </div>
            </div>

            {/* Selected indicator */}
            {selected && (
              <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
