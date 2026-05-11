import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { AuditSummary } from "@/types/audit";
import AuditResultsView from "@/components/audit-results-view";

// Fetch and memoize — used in both generateMetadata and the page
const getAudit = cache(async (shareToken: string) => {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq("share_token", shareToken)
    .single();

  if (error || !data) return null;
  return data as {
    id: string;
    share_token: string;
    audit_result: AuditSummary;
    total_monthly_savings: number;
    team_size: number;
    tools_input: unknown;
  };
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) {
    return { title: "Audit not found — SpendLens" };
  }
  const tools = audit.audit_result.results
    .slice(0, 3)
    .map((r) => r.toolName)
    .join(", ");
  
  const savings = Math.round(audit.total_monthly_savings);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://spend-lens-one.vercel.app";
  const url = `${baseUrl}/audit/${id}`; 
  const ogImageUrl = `${baseUrl}/api/og?savings=${savings}&tools=${encodeURIComponent(tools)}`;

  return {
    title: `SpendLens — $${savings}/month in AI savings found`,
    description: `See how this team can save $${savings}/mo on their AI tool spend.`,
    openGraph: {
      title: `SpendLens — $${savings}/month in AI savings found`,
      description: `See how this team can save $${savings}/mo on their AI tool spend.`,
      url,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `SpendLens — $${savings}/month in AI savings found`,
      description: `See how this team can save $${savings}/mo on their AI tool spend.`,
      images: [ogImageUrl],
    },
  };
}

export default async function AuditResultsPage({ params }: Props) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) notFound();

  return <AuditResultsView audit={audit} />;
}
