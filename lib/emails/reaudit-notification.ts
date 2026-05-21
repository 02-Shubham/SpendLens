import { Resend } from "resend";
import crypto from "crypto";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

export function generateReauditToken(email: string): string {
  const secret = process.env.REAUDIT_SECRET || "default_secret_for_local_dev";
  return crypto.createHmac("sha256", secret).update(email).digest("hex");
}

export interface AffectedAudit {
  audit_id: string;
  toolsAffected: string[];
}

export async function sendReauditEmail(
  email: string,
  affectedAudits: AffectedAudit[]
) {
  if (!resend) {
    console.warn("Resend API key missing. Would have sent re-audit email to:", email);
    return;
  }

  const token = generateReauditToken(email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spendlens.app";
  const rerunLink = `${appUrl}/reaudit?email=${encodeURIComponent(email)}&token=${token}`;

  // Deduplicate affected tools across all audits
  const allAffectedTools = new Set<string>();
  affectedAudits.forEach(a => a.toolsAffected.forEach(t => allAffectedTools.add(t)));
  const toolsList = Array.from(allAffectedTools).join(", ");

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <div style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
        <strong style="font-size: 18px;">SpendLens</strong>
        <span style="color: #6b7280; font-size: 14px; margin-left: 8px;">Pricing Update Alert</span>
      </div>
      <div style="padding: 24px 0;">
        <h2 style="font-size: 20px; margin: 0 0 12px;">Pricing updates affect your audit</h2>
        <p style="color: #374151; margin: 0 0 16px;">
          We detected pricing changes for tools in your stack. Your previous recommendations may no longer be optimal.
        </p>
        <div style="background: #fffbeb; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #fde68a;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>${toolsList}</strong> pricing has been updated since your last audit.
          </p>
        </div>
        <a href="${rerunLink}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
          Re-run your audit with current pricing →
        </a>
      </div>
      <div style="padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        SpendLens · AI tool spend analysis
      </div>
    </div>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: "AI tool pricing changed — your audit needs updating",
    html: emailHtml,
  });
}
