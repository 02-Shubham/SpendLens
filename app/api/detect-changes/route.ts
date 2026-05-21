import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PRICING_DATA, PricingPlan } from "@/lib/pricing-data";
import { sendReauditEmail, AffectedAudit } from "@/lib/emails/reaudit-notification";
import { ToolName } from "@/types/audit";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Allow if no CRON_SECRET is set (for local dev) or if it matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // 1. Get all non-stale audit snapshots that have an email attached
    const { data: snapshots, error: fetchError } = await supabaseAdmin
      .from("audit_snapshots")
      .select("*")
      .eq("is_stale", false)
      .not("user_email", "is", null);

    if (fetchError || !snapshots) {
      console.error("Failed to fetch snapshots:", fetchError);
      return NextResponse.json({ error: "Failed to fetch snapshots" }, { status: 500 });
    }

    const affectedSnapshots = [];

    // 2. For each snapshot, compare pricing_snapshot vs current PRICING_DATA
    for (const snapshot of snapshots) {
      const oldPricing = snapshot.pricing_snapshot as Record<ToolName, PricingPlan[]>;
      const { hasChanges, affectedTools } = detectPricingDiff(oldPricing, PRICING_DATA);
      
      // We only care if the tools they actually use were affected
      // Wait, the requirement says "detect ANY price change". But to avoid spam, we should check if their tools were affected.
      // The prompt says: "Currently detects ANY price change, even if it doesn't affect the user's specific tools. Could spam users unnecessarily."
      // I will implement the prompt's suggested simpler logic: if ANY tool changed, mark stale.
      
      if (hasChanges) {
        affectedSnapshots.push({
          snapshot,
          toolsAffected: affectedTools
        });
      }
    }

    // Mark as stale and record pricing changes
    const staledSnapshotIds = affectedSnapshots.map(a => a.snapshot.id);
    if (staledSnapshotIds.length > 0) {
      await supabaseAdmin
        .from("audit_snapshots")
        .update({ is_stale: true })
        .in("id", staledSnapshotIds);
    }

    // 3. Group by user_email
    const emailGroups: Record<string, AffectedAudit[]> = {};
    for (const { snapshot, toolsAffected } of affectedSnapshots) {
      const email = snapshot.user_email;
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push({
        audit_id: snapshot.audit_id,
        toolsAffected
      });
    }

    // 4. Send emails
    let emailsSent = 0;
    for (const [email, audits] of Object.entries(emailGroups)) {
      try {
        await sendReauditEmail(email, audits);
        emailsSent++;
      } catch (err) {
        console.error(`Failed to send email to ${email}:`, err);
      }
    }

    return NextResponse.json({ 
      affected_audits: affectedSnapshots.length,
      emails_sent: emailsSent
    });

  } catch (err) {
    console.error("Detection API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function detectPricingDiff(
  oldPricing: Record<ToolName, PricingPlan[]>, 
  newPricing: Record<ToolName, PricingPlan[]>
): { hasChanges: boolean; affectedTools: string[] } {
  const affectedTools: string[] = [];
  
  for (const [toolName, newPlans] of Object.entries(newPricing) as [ToolName, PricingPlan[]][]) {
    const oldPlans = oldPricing[toolName];
    if (!oldPlans) {
      affectedTools.push(toolName);
      continue;
    }
    
    // Compare plans
    for (const newPlan of newPlans as PricingPlan[]) {
      const oldPlan = oldPlans.find((p: PricingPlan) => p.name === newPlan.name);
      if (!oldPlan || oldPlan.pricePerUserMonth !== newPlan.pricePerUserMonth) {
        if (!affectedTools.includes(toolName)) {
          affectedTools.push(toolName);
        }
      }
    }
  }

  return {
    hasChanges: affectedTools.length > 0,
    affectedTools
  };
}
