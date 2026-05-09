"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ShareSectionProps {
  shareToken: string;
}

export default function ShareSection({ shareToken }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/audit/${shareToken}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mx-auto flex flex-col items-center justify-center py-8 text-center px-6">
      <p className="text-[14px] text-text-secondary mb-4">
        Know someone overpaying for AI tools?
      </p>
      
      <div className="flex w-full max-w-[420px] items-center gap-2 rounded-md border border-border bg-surface p-1.5 shadow-(--shadow-sm)">
        <input 
          readOnly 
          value={url} 
          className="flex-1 bg-transparent px-3 text-[13px] text-text-tertiary outline-none overflow-hidden text-ellipsis"
        />
        <button
          onClick={copyLink}
          className="shrink-0 flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-100 text-[12px] font-medium px-4 py-1.5 rounded-sm hover:bg-green-100 transition-all active:scale-95"
        >
          {copied ? (
            <>Copied <Check className="h-3 w-3" /></>
          ) : (
            <>Copy link <Copy className="h-3 w-3" /></>
          )}
        </button>
      </div>
    </div>
  );
}
