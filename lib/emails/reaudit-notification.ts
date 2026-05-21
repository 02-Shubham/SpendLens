import { Resend } from "resend";
import crypto from "crypto";
import { PricingChange, RecommendationChange } from "@/lib/pricing-change-detection";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

export function generateReauditToken(email: string, auditId?: string): string {
  const secret = process.env.REAUDIT_SECRET || "default_secret_for_local_dev";
  return crypto.createHmac("sha256", secret).update(`${email}:${auditId || ""}`).digest("hex");
}

export function generateUnsubscribeToken(email: string): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET ||
    process.env.REAUDIT_SECRET ||
    "default_secret_for_local_dev";
  return crypto.createHmac("sha256", secret).update(email).digest("hex");
}

export interface AffectedAudit {
  audit_id: string;
  toolsAffected: string[];
  changes?: PricingChange[];
  recommendationChanges?: RecommendationChange[];
  oldTopRecommendation?: string;
  newTopRecommendation?: string;
  savingsDelta?: number;
}

export async function sendReauditEmail(
  email: string,
  affectedAudits: AffectedAudit[]
) {
  if (!resend) {
    console.warn("Resend API key missing. Would have sent re-audit email to:", email);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spendlens.app";
  const unsubscribeToken = generateUnsubscribeToken(email);
  const unsubscribeLink = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;

  // Deduplicate affected tools across all audits
  const allAffectedTools = new Set<string>();
  affectedAudits.forEach(a => a.toolsAffected.forEach(t => allAffectedTools.add(t)));
  const toolsList = Array.from(allAffectedTools).join(", ");
  const auditBlocks = affectedAudits.map((audit) => {
    const auditToken = generateReauditToken(email, audit.audit_id);
    const rerunLink = `${appUrl}/reaudit?email=${encodeURIComponent(email)}&auditId=${audit.audit_id}&token=${auditToken}`;
    const pricingItems = (audit.changes || []).slice(0, 4).map((change) => {
      const oldPrice = change.oldPrice === null ? "new" : `$${change.oldPrice}/user/mo`;
      const newPrice = change.newPrice === null ? "removed" : `$${change.newPrice}/user/mo`;
      return `<li><strong>${change.toolName} ${change.planName}</strong>: ${oldPrice} → ${newPrice}</li>`;
    }).join("");
    const recommendationItems = (audit.recommendationChanges || []).slice(0, 3).map((change) => (
      `<li><strong>${change.toolName}</strong>: ${change.oldAction} → ${change.newAction}</li>`
    )).join("");
    const savingsDelta = audit.savingsDelta || 0;
    const deltaText = `${savingsDelta >= 0 ? "+" : ""}$${Math.round(savingsDelta)}/mo`;

    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 18px 0;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Audit ${audit.audit_id.slice(0, 8)}</p>
        <p style="margin: 0 0 8px; color: #374151; font-size: 14px;"><strong>Savings impact:</strong> ${deltaText}</p>
        ${pricingItems ? `<p style="margin: 12px 0 4px; font-weight: 700; font-size: 14px;">What changed</p><ul style="margin: 0 0 12px; padding-left: 18px; color: #374151; font-size: 14px;">${pricingItems}</ul>` : ""}
        ${recommendationItems ? `<p style="margin: 12px 0 4px; font-weight: 700; font-size: 14px;">How it affects your audit</p><ul style="margin: 0 0 12px; padding-left: 18px; color: #374151; font-size: 14px;">${recommendationItems}</ul>` : `<p style="margin: 0 0 12px; color: #374151; font-size: 14px;">Your previous recommendation may need review with current pricing.</p>`}
        <a href="${rerunLink}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px;">View updated audit</a>
      </div>
    `;
  }).join("");

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
        ${auditBlocks}
      </div>
      <div style="padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
        SpendLens · AI tool spend analysis · <a href="${unsubscribeLink}" style="color: #6b7280;">Unsubscribe from re-audit alerts</a>
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
