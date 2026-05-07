"use client";

import { useState } from "react";

interface ShareSectionProps {
  shareToken: string;
}

export default function ShareSection({ shareToken }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://spendlens.app";
    const url = `${baseUrl}/audit/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border border-gray-200 bg-white rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="font-medium text-gray-900 text-sm">Share this audit</p>
        <p className="text-xs text-gray-400 mt-0.5">
          The link shows all tool and savings data — email and company info is
          never shared.
        </p>
      </div>
      <button
        id="copy-link"
        onClick={copyLink}
        className="shrink-0 border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        aria-live="polite"
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
