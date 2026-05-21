import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";

interface PricingChangeRow {
  id: string;
  tool_name: string;
  plan_name: string;
  change_type: string;
  old_price: number | null;
  new_price: number | null;
  detected_at: string;
  affected_audits_count: number;
}

function formatPrice(price: number | null) {
  if (price === null) return "N/A";
  return `$${price}/user/mo`;
}

function formatChangeType(changeType: string) {
  return changeType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function getPricingChanges(): Promise<PricingChangeRow[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("pricing_changes")
    .select("*")
    .order("detected_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch pricing changes:", error);
    return [];
  }

  return (data || []) as PricingChangeRow[];
}

export default async function PricingChangesPage() {
  const changes = await getPricingChanges();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to SpendLens
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              AI Tool Pricing Changes
            </h1>
            <p className="mt-1 text-gray-600">
              Pricing updates detected by SpendLens re-audit runs.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tool</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Change</th>
                  <th className="px-4 py-3 font-semibold">Old</th>
                  <th className="px-4 py-3 font-semibold">New</th>
                  <th className="px-4 py-3 font-semibold">Affected Audits</th>
                  <th className="px-4 py-3 font-semibold">Detected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {changes.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                      No pricing changes have been recorded yet.
                    </td>
                  </tr>
                ) : (
                  changes.map((change) => (
                    <tr key={change.id}>
                      <td className="px-4 py-4 font-medium text-gray-900">{change.tool_name}</td>
                      <td className="px-4 py-4 text-gray-700">{change.plan_name}</td>
                      <td className="px-4 py-4 text-gray-700">{formatChangeType(change.change_type)}</td>
                      <td className="px-4 py-4 text-gray-500">{formatPrice(change.old_price)}</td>
                      <td className="px-4 py-4 font-medium text-gray-900">{formatPrice(change.new_price)}</td>
                      <td className="px-4 py-4 text-gray-700">{change.affected_audits_count}</td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(change.detected_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
