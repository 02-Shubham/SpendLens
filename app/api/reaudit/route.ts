import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateReauditToken } from "@/lib/emails/reaudit-notification";
import { runAudit } from "@/lib/audit-engine";
import { UserTool, AuditSummary } from "@/types/audit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
    }

    const expectedToken = generateReauditToken(email);
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Fetch the most recent stale snapshot for the user
    const { data: snapshot, error: fetchError } = await supabaseAdmin
      .from("audit_snapshots")
      .select("*")
      .eq("user_email", email)
      .eq("is_stale", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !snapshot) {
      return NextResponse.json({ error: "No stale audit found for this email" }, { status: 404 });
    }

    const oldSummary = snapshot.audit_result as AuditSummary;
    const tools = snapshot.tools_input as UserTool[];

    // Re-run the audit with current PRICING_DATA
    const newSummary = runAudit(
      tools,
      oldSummary.teamSize,
      oldSummary.orgType,
      oldSummary.growthTrajectory
    );

    return NextResponse.json({
      oldAudit: {
        created_at: snapshot.created_at,
        summary: oldSummary,
        pricing_snapshot: snapshot.pricing_snapshot
      },
      newAudit: {
        summary: newSummary
      },
      tools
    });

  } catch (err) {
    console.error("Re-audit API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
