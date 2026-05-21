"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AuditSummary, AuditResult } from "@/types/audit";

function ResultDiff({ oldResult, newResult }: { oldResult?: AuditResult, newResult: AuditResult }) {
  if (!oldResult) {
    return (
      <div className="p-4 border rounded-lg bg-white mb-4">
        <h4 className="font-medium text-lg">{newResult.toolName}</h4>
        <p className="text-sm text-gray-500 mb-2">New addition or no previous data</p>
        <p className="text-sm font-semibold">{newResult.recommendedAction}</p>
      </div>
    );
  }

  const hasChanged = 
    oldResult.recommendation !== newResult.recommendation ||
    oldResult.monthlySavings !== newResult.monthlySavings;

  return (
    <div className={`p-4 border rounded-lg mb-4 ${hasChanged ? 'bg-yellow-50 border-yellow-200' : 'bg-white opacity-60'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-lg flex items-center gap-2">
          {newResult.toolName}
          {hasChanged && <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 hover:bg-yellow-300">Changed</Badge>}
        </h4>
      </div>
      
      {hasChanged ? (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Previous</p>
              <p className="text-gray-700 line-through opacity-70">{oldResult.recommendedAction}</p>
              <p className="text-gray-500 mt-1">Savings: $${oldResult.monthlySavings}/mo</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Updated</p>
              <p className="font-medium text-green-700">{newResult.recommendedAction}</p>
              <p className="font-medium mt-1">Savings: $${newResult.monthlySavings}/mo</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600">{newResult.recommendedAction}</p>
          <p className="text-sm text-gray-500 mt-1">Savings: $${newResult.monthlySavings}/mo</p>
        </div>
      )}
    </div>
  );
}

function ReauditContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const auditId = searchParams.get("auditId");
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface ReauditData {
    oldAudit: { created_at: string; summary: AuditSummary };
    newAudit: { summary: AuditSummary };
  }
  const [data, setData] = useState<ReauditData | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!email || !auditId || !token) {
        setError("Missing email, audit ID, or token");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/reaudit?email=${encodeURIComponent(email)}&auditId=${auditId}&token=${token}`);
        const json = await res.json();
        
        if (!res.ok) {
          setError(json.error || "Failed to load audit");
        } else {
          setData(json);
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [email, auditId, token]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center max-w-lg mx-auto mt-12">
        <h3 className="text-lg font-bold mb-2">Error loading re-audit</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center max-w-lg mx-auto mt-12">
        <h3 className="text-lg font-bold mb-2">No audit data found</h3>
        <p>We could not load a stale audit for this re-audit link.</p>
      </div>
    );
  }

  const oldSummary = data.oldAudit.summary as AuditSummary;
  const newSummary = data.newAudit.summary as AuditSummary;
  const dateStr = new Date(data.oldAudit.created_at).toLocaleDateString();
  const savingsDiff = newSummary.totalMonthlySavings - oldSummary.totalMonthlySavings;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">Your Updated AI Spend Audit</h1>
        <p className="text-lg text-gray-600">
          We detected pricing changes affecting your stack since {dateStr}. Here&apos;s how your recommendations have shifted.
        </p>
      </div>

      <div className="mb-12">
        <div className={`p-6 border rounded-xl ${savingsDiff > 0 ? 'bg-green-50 border-green-200' : savingsDiff < 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-1">New Total Potential Savings</p>
              <p className="text-4xl font-extrabold text-gray-900">$${Math.round(newSummary.totalMonthlySavings)}<span className="text-lg font-normal text-gray-500">/mo</span></p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-sm font-medium text-gray-500 mb-1">Change from previous</p>
              <p className={`text-xl font-bold ${savingsDiff > 0 ? 'text-green-600' : savingsDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {savingsDiff > 0 ? '+' : ''}$${Math.round(savingsDiff)}/mo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-6 text-gray-900 border-b pb-2">Tool-by-Tool Breakdown</h3>
        <div className="space-y-2">
          {newSummary.results.map((newResult) => {
            const oldResult = oldSummary.results.find(r => r.toolName === newResult.toolName);
            return (
              <ResultDiff key={newResult.toolName} oldResult={oldResult} newResult={newResult} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ReauditPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading...</div>}>
        <ReauditContent />
      </Suspense>
    </div>
  );
}
