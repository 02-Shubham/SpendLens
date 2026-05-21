import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PRICING_DATA, PricingPlan } from "@/lib/pricing-data";
import { sendReauditEmail, AffectedAudit } from "@/lib/emails/reaudit-notification";
import { AuditSummary, UserTool } from "@/types/audit";
import { runAudit } from "@/lib/audit-engine";
import {
  detectPricingChanges,
  filterChangesForStack,
  findRecommendationChanges,
  PricingChange,
} from "@/lib/pricing-change-detection";

const DEFAULT_EMAIL_GROUP_LIMIT = 25;

interface SnapshotRow {
  id: string;
  audit_id: string;
  user_email: string;
  tools_input: UserTool[];
  audit_result: AuditSummary;
  pricing_snapshot: Record<string, PricingPlan[]>;
}

interface AffectedSnapshot {
  snapshot: SnapshotRow;
  changes: PricingChange[];
  audit: AffectedAudit;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const emailGroupLimit = Math.max(
      1,
      Number(searchParams.get("limit") || DEFAULT_EMAIL_GROUP_LIMIT)
    );

    const { data: snapshots, error: fetchError } = await supabaseAdmin
      .from("audit_snapshots")
      .select("*")
      .eq("is_stale", false)
      .not("user_email", "is", null);

    if (fetchError || !snapshots) {
      console.error("Failed to fetch snapshots:", fetchError);
      return NextResponse.json({ error: "Failed to fetch snapshots" }, { status: 500 });
    }

    const affectedSnapshots: AffectedSnapshot[] = [];

    for (const rawSnapshot of snapshots) {
      const snapshot = rawSnapshot as SnapshotRow;
      const oldSummary = snapshot.audit_result;
      const tools = snapshot.tools_input;
      const newSummary = runAudit(
        tools,
        oldSummary.teamSize,
        oldSummary.orgType,
        oldSummary.growthTrajectory
      );

      const allPricingChanges = detectPricingChanges(
        snapshot.pricing_snapshot,
        PRICING_DATA
      );
      const stackPricingChanges = filterChangesForStack(allPricingChanges, tools);
      const recommendationChanges = findRecommendationChanges(oldSummary, newSummary);

      if (stackPricingChanges.length === 0 && recommendationChanges.length === 0) {
        continue;
      }

      affectedSnapshots.push({
        snapshot,
        changes: stackPricingChanges,
        audit: {
          audit_id: snapshot.audit_id,
          toolsAffected: Array.from(
            new Set([
              ...stackPricingChanges.map((change) => change.toolName),
              ...recommendationChanges.map((change) => change.toolName),
            ])
          ),
          changes: stackPricingChanges,
          recommendationChanges,
          oldTopRecommendation: topRecommendation(oldSummary),
          newTopRecommendation: topRecommendation(newSummary),
          savingsDelta: newSummary.totalMonthlySavings - oldSummary.totalMonthlySavings,
        },
      });
    }

    const staledSnapshotIds = affectedSnapshots.map((item) => item.snapshot.id);
    if (staledSnapshotIds.length > 0) {
      await supabaseAdmin
        .from("audit_snapshots")
        .update({ is_stale: true })
        .in("id", staledSnapshotIds);
    }

    await recordPricingChanges(affectedSnapshots);

    const emailGroups = await buildEmailGroups(affectedSnapshots);
    const emailEntries = Object.entries(emailGroups).slice(0, emailGroupLimit);

    let emailsSent = 0;
    for (const [email, audits] of emailEntries) {
      try {
        await sendReauditEmail(email, audits);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
      }
    }

    const notifiedAuditIds = emailEntries.flatMap(([, audits]) =>
      audits.map((audit) => audit.audit_id)
    );
    if (notifiedAuditIds.length > 0) {
      await supabaseAdmin
        .from("audit_snapshots")
        .update({ notified_at: new Date().toISOString() })
        .in("audit_id", notifiedAuditIds);
    }

    return NextResponse.json({
      affected_audits: affectedSnapshots.length,
      email_groups: Object.keys(emailGroups).length,
      emails_sent: emailsSent,
      remaining_email_groups: Math.max(0, Object.keys(emailGroups).length - emailEntries.length),
    });
  } catch (err) {
    console.error("Detection API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function topRecommendation(summary: AuditSummary): string {
  return [...summary.results].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0]?.recommendedAction || "No recommendation";
}

async function buildEmailGroups(
  affectedSnapshots: AffectedSnapshot[]
): Promise<Record<string, AffectedAudit[]>> {
  const emailGroups: Record<string, AffectedAudit[]> = {};
  const emails = Array.from(
    new Set(affectedSnapshots.map((item) => item.snapshot.user_email))
  );

  const { data: preferences } = emails.length > 0 && supabaseAdmin
    ? await supabaseAdmin
        .from("email_preferences")
        .select("email, reaudit_emails_enabled")
        .in("email", emails)
    : { data: [] };

  const disabledEmails = new Set(
    (preferences || [])
      .filter((preference) => preference.reaudit_emails_enabled === false)
      .map((preference) => preference.email)
  );

  for (const { snapshot, audit } of affectedSnapshots) {
    const email = snapshot.user_email;
    if (disabledEmails.has(email)) continue;

    if (!emailGroups[email]) {
      emailGroups[email] = [];
    }
    emailGroups[email].push(audit);
  }

  return emailGroups;
}

async function recordPricingChanges(affectedSnapshots: AffectedSnapshot[]) {
  if (!supabaseAdmin || affectedSnapshots.length === 0) return;

  const changeCounts = new Map<string, { change: PricingChange; count: number }>();
  for (const item of affectedSnapshots) {
    for (const change of item.changes) {
      const key = [
        change.toolName,
        change.planName,
        change.changeType,
        change.oldPrice,
        change.newPrice,
      ].join(":");
      const existing = changeCounts.get(key);
      changeCounts.set(key, {
        change,
        count: (existing?.count || 0) + 1,
      });
    }
  }

  const rows = Array.from(changeCounts.values()).map(({ change, count }) => ({
    tool_name: change.toolName,
    plan_name: change.planName,
    change_type: change.changeType,
    old_price: change.oldPrice,
    new_price: change.newPrice,
    affected_audits_count: count,
  }));

  if (rows.length === 0) return;

  const { error } = await supabaseAdmin.from("pricing_changes").insert(rows);
  if (error) {
    console.error("Failed to record pricing changes:", error);
  }
}
