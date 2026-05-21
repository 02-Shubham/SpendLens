import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { supabaseAdmin } from "@/lib/supabase";
import { UserTool, OrgType, GrowthTrajectory } from "@/types/audit";
import { PRICING_DATA } from "@/lib/pricing-data";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { tools, teamSize, orgType, growthTrajectory } = await req.json();
    
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    if (!tools || !Array.isArray(tools)) {
      return NextResponse.json({ error: "Invalid tools input" }, { status: 400 });
    }

    const auditSummary = runAudit(
      tools as UserTool[],
      teamSize as number,
      orgType as OrgType,
      (growthTrajectory as GrowthTrajectory) || "stable"
    );
    
    // Generate a unique share token (12 chars hex)
    const shareToken = crypto.randomBytes(6).toString("hex");

    const { data, error } = await supabaseAdmin
      .from("audits")
      .insert({
        tools_input: tools,
        audit_result: auditSummary,
        total_monthly_savings: auditSummary.totalMonthlySavings,
        team_size: teamSize,
        share_token: shareToken,
        is_lead: auditSummary.hasHighSavings
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to save audit" }, { status: 500 });
    }

    // Save snapshot for detection job
    const { error: snapshotError } = await supabaseAdmin
      .from("audit_snapshots")
      .insert({
        audit_id: data.id,
        user_email: null, // Will be updated when lead is captured
        tools_input: tools,
        audit_result: auditSummary,
        pricing_snapshot: PRICING_DATA,
      });

    if (snapshotError) {
      console.error("Failed to save audit snapshot:", snapshotError);
      // We don't fail the audit request if snapshot fails
    }

    return NextResponse.json({
      auditId: data.id,
      shareToken,
      summary: auditSummary
    });
  } catch (err) {
    console.error("Audit API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
