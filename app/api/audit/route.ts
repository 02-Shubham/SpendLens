import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-engine";
import { supabaseAdmin } from "@/lib/supabase";
import { UserTool, OrgType } from "@/types/audit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { tools, teamSize, orgType } = await req.json();

    if (!tools || !Array.isArray(tools)) {
      return NextResponse.json({ error: "Invalid tools input" }, { status: 400 });
    }

    const auditSummary = runAudit(tools as UserTool[], teamSize as number, orgType as OrgType);
    
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
