import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { headers } from "next/headers";
import { AuditSummary } from "@/types/audit";

const resend = new Resend(process.env.RESEND_API_KEY || "");

// Simple in-memory rate limiter: 3 submissions per IP per hour
// Note: this resets on cold starts. For production use Upstash Redis.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const { shareToken, email, companyName, role } = await req.json();

    if (!shareToken || !email) {
      return NextResponse.json(
        { error: "shareToken and email are required" },
        { status: 400 }
      );
    }

    // Fetch the audit so we can build the email body
    const { data: audit, error: fetchError } = await supabaseAdmin
      .from("audits")
      .select("*")
      .eq("share_token", shareToken)
      .single();

    if (fetchError || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    const summary: AuditSummary = audit.audit_result;
    const topRecommendation = [...summary.results].sort(
      (a, b) => b.monthlySavings - a.monthlySavings
    )[0];

    const isHighSavings = summary.hasHighSavings;
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://spendlens.app";
    const auditUrl = `${appUrl}/audit/${shareToken}`;

    // Update the audit row
    const { error: updateError } = await supabaseAdmin
      .from("audits")
      .update({
        email,
        company_name: companyName || null,
        role: role || null,
        is_lead: true,
      })
      .eq("share_token", shareToken);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="font-size: 18px;">SpendLens</strong>
            <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">AI Spend Audit</span>
          </div>
          <div style="padding: 24px 0;">
            <h1 style="font-size: 22px; margin: 0 0 8px;">Your AI spend audit is ready</h1>
            <p style="color: #374151; margin: 0 0 24px;">
              Here's a summary of what we found.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                Potential monthly savings
              </p>
              <p style="margin: 0; font-size: 36px; font-weight: 800; color: #15803d;">
                $${Math.round(summary.totalMonthlySavings)}/mo
              </p>
              <p style="margin: 4px 0 0; color: #166534; font-size: 14px;">
                That's $${Math.round(summary.totalAnnualSavings)}/year
              </p>
            </div>
            ${
              topRecommendation?.monthlySavings > 0
                ? `<div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600;">Top recommendation</p>
                <p style="margin: 0; color: #111; font-size: 14px;">${topRecommendation.recommendedAction}</p>
              </div>`
                : ""
            }
            ${
              isHighSavings
                ? `<p style="color: #374151; font-size: 14px; margin-bottom: 24px; padding: 14px 16px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
                💡 <strong>A Credex advisor will reach out within 24 hours</strong> to help you capture these savings.
              </p>`
                : ""
            }
            <a href="${auditUrl}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
              View your full audit →
            </a>
          </div>
          <div style="padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
            SpendLens · AI tool spend analysis
          </div>
        </div>
      `;

      await resend.emails.send({
        from: "SpendLens <audit@spendlens.app>",
        to: email,
        subject: "Your AI spend audit from SpendLens",
        html: emailHtml,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Leads API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
