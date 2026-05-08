import {
  UserTool,
  OrgType,
  AuditResult,
  AuditSummary,
  RecommendationType,
  WorkflowTag,
} from "@/types/audit";
import { PRICING_DATA } from "./pricing-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const IS_API_TOOL = (name: string) =>
  name === "Anthropic API" || name === "OpenAI API";

const hasCodingWorkflow = (t: UserTool) => t.workflows.includes("coding");
const hasWritingWorkflow = (t: UserTool) => t.workflows.includes("writing");

/** Tools that are primarily coding assistants */
const CODING_TOOLS = new Set(["Cursor", "GitHub Copilot", "Windsurf"]);

// ─── Main function ────────────────────────────────────────────────────────────

export function runAudit(
  tools: UserTool[],
  teamSize: number,
  orgType: OrgType
): AuditSummary {
  const results: AuditResult[] = tools.map((tool) => {
    const pricingPlans = PRICING_DATA[tool.toolName];
    const currentMonthlyCost = tool.monthlySpend || 0;

    let recommendation: RecommendationType = "optimal";
    let recommendedAction = "Your current plan is optimal for your usage.";
    let projectedMonthlyCost = currentMonthlyCost;
    let reasoning = `You are on the ${tool.plan} plan which fits your team's workflows (${tool.workflows.join(", ") || "general use"}).`;
    const workflowOverlaps: string[] = [];

    // ── Rule 1: Downgrade Business/Team if seats ≤ 3 ──────────────────────────
    if (
      tool.seats <= 3 &&
      (tool.plan.toLowerCase().includes("business") ||
        tool.plan.toLowerCase().includes("team"))
    ) {
      const proPlan = pricingPlans.find(
        (p) =>
          p.name.toLowerCase().includes("pro") ||
          p.name.toLowerCase().includes("individual") ||
          p.name.toLowerCase().includes("plus")
      );
      if (proPlan) {
        recommendation = "downgrade";
        projectedMonthlyCost = proPlan.pricePerUserMonth * tool.seats;
        const savings = currentMonthlyCost - projectedMonthlyCost;
        recommendedAction = `Downgrade from ${tool.plan} to ${proPlan.name} — ${tool.seats} seats don't justify a team plan.`;
        reasoning = `Business/Team plans include admin and compliance features that teams of 3 or fewer rarely need. Switching to ${proPlan.name} saves $${savings.toFixed(0)}/mo with no loss to core AI capabilities.`;
      }
    }

    // ── Rule 2: Writing workflows + dedicated coding tool ─────────────────────
    // If this tool is a pure coding assistant but user only tagged writing workflows
    if (
      CODING_TOOLS.has(tool.toolName) &&
      tool.workflows.length > 0 &&
      !hasCodingWorkflow(tool) &&
      hasWritingWorkflow(tool)
    ) {
      const claudePro = PRICING_DATA["Claude"].find((p) => p.name === "Pro");
      if (claudePro) {
        recommendation = "switch";
        projectedMonthlyCost = claudePro.pricePerUserMonth * tool.seats;
        recommendedAction = `Switch from ${tool.toolName} to Claude Pro for writing workflows.`;
        reasoning = `${tool.toolName} is optimised for autocomplete and code generation. For writing-focused workflows, Claude Pro offers superior long-form editing, nuanced tone control, and context retention at $${claudePro.pricePerUserMonth}/user — better fit for how your team actually uses it.`;
      }
    }

    // ── Rule 3: Redundancy — Cursor AND Copilot, both with coding workflows ────
    if (
      tool.toolName === "GitHub Copilot" &&
      hasCodingWorkflow(tool) &&
      tools.some((t) => t.toolName === "Cursor" && hasCodingWorkflow(t))
    ) {
      recommendation = "redundant";
      projectedMonthlyCost = 0;
      recommendedAction = "Drop GitHub Copilot — Cursor covers all the same coding workflows.";
      reasoning =
        "Both Cursor and GitHub Copilot provide inline autocomplete, chat, and AI-powered code generation. Running both for coding workflows is redundant. Cursor's deeper IDE integration and model selection makes it the stronger single choice. Dropping Copilot eliminates the full subscription cost.";
    }

    // ── Rule 4: API spend > $100 — consider flat plan ─────────────────────────
    if (IS_API_TOOL(tool.toolName) && currentMonthlyCost > 100) {
      const vendorName = tool.toolName.startsWith("Anthropic")
        ? "Claude"
        : "ChatGPT";
      const teamPlan = PRICING_DATA[vendorName]?.find((p) => p.name === "Team");
      if (teamPlan) {
        const flatCost = teamPlan.pricePerUserMonth * teamSize;
        if (flatCost < currentMonthlyCost) {
          recommendation = "downgrade";
          projectedMonthlyCost = flatCost;
          recommendedAction = `Switch API usage to the ${vendorName} Team plan ($${teamPlan.pricePerUserMonth}/user × ${teamSize} users = $${flatCost}/mo).`;
          reasoning = `Your monthly API spend ($${currentMonthlyCost}) exceeds the flat Team plan cost for your team size. A Team plan provides predictable billing, higher rate limits, and no usage-based surprises.`;
        } else {
          recommendedAction = `Your API spend ($${currentMonthlyCost}/mo) is within a reasonable range. Monitor usage as your team grows.`;
          reasoning = `A ${vendorName} Team plan for ${teamSize} users would cost $${flatCost}/mo — more than your current API spend. Pay-as-you-go is still the efficient choice at your scale.`;
        }
      }
    }

    // ── Rule 5: Cross-tool overlap detection (writing/support) ────────────────
    if (tool.workflows.length > 0) {
      const overlappingTags: WorkflowTag[] = ["writing", "support", "research", "data"];
      for (const tag of overlappingTags) {
        if (!tool.workflows.includes(tag)) continue;
        const overlappingTools = tools.filter(
          (other) =>
            other.toolName !== tool.toolName && other.workflows.includes(tag)
        );
        for (const other of overlappingTools) {
          const overlap = `${other.toolName} also covers "${tag}" workflows`;
          if (!workflowOverlaps.includes(overlap)) {
            workflowOverlaps.push(overlap);
          }
        }
      }
    }

    // ── Rule 6: Credex credits note on any savings ────────────────────────────
    const monthlySavings = Math.max(0, currentMonthlyCost - projectedMonthlyCost);
    if (monthlySavings > 0) {
      reasoning +=
        " Purchasing seats through Credex can add an extra 15–30% in enterprise credits on top of these savings.";
    }

    const annualSavings = monthlySavings * 12;

    return {
      toolName: tool.toolName,
      currentPlan: tool.plan,
      currentMonthlyCost,
      recommendation,
      recommendedAction,
      projectedMonthlyCost,
      monthlySavings,
      annualSavings,
      reasoning,
      workflowOverlaps: workflowOverlaps.length > 0 ? workflowOverlaps : undefined,
    };
  });

  const totalMonthlySavings = results.reduce((acc, r) => acc + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    hasHighSavings: totalMonthlySavings > 500,
    orgType,
    teamSize,
  };
}
