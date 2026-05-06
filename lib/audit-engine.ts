import { 
  UserTool, 
  UseCase, 
  AuditResult, 
  AuditSummary, 
  RecommendationType 
} from "@/types/audit";
import { PRICING_DATA } from "./pricing-data";

export function runAudit(
  tools: UserTool[],
  teamSize: number,
  useCase: UseCase
): AuditSummary {
  const results: AuditResult[] = tools.map((tool) => {
    const pricingPlans = PRICING_DATA[tool.toolName];
    const currentMonthlyCost = tool.monthlySpend || 0;
    
    let recommendation: RecommendationType = "optimal";
    let recommendedAction = "Your current plan is optimal for your usage.";
    let projectedMonthlyCost = currentMonthlyCost;
    let reasoning = `You are on the ${tool.plan} plan which fits your team size of ${tool.seats}.`;

    // Rule 1: Downgrade from Business/Team if seats <= 3
    if (tool.seats <= 3 && (tool.plan.toLowerCase().includes("business") || tool.plan.toLowerCase().includes("team"))) {
      const proPlan = pricingPlans.find(p => p.name.toLowerCase().includes("pro") || p.name.toLowerCase().includes("individual") || p.name.toLowerCase().includes("plus"));
      if (proPlan) {
        recommendation = "downgrade";
        projectedMonthlyCost = proPlan.pricePerUserMonth * tool.seats;
        const savings = currentMonthlyCost - projectedMonthlyCost;
        recommendedAction = `Downgrade from ${tool.plan} to ${proPlan.name} — you have ${tool.seats} users and ${proPlan.name} is sufficient.`;
        reasoning = `Business/Team plans often include administrative features not needed for teams of 3 or fewer. Switching to ${proPlan.name} saves $${savings}/mo without losing core AI capabilities.`;
      }
    }

    // Rule 2: Writing use case with coding tools
    if (useCase === "writing" && (tool.toolName === "Cursor" || tool.toolName === "GitHub Copilot")) {
      const claudePro = PRICING_DATA["Claude"].find(p => p.name === "Pro");
      if (claudePro) {
        recommendation = "switch";
        projectedMonthlyCost = claudePro.pricePerUserMonth * tool.seats;
        recommendedAction = `Switch from ${tool.toolName} to Claude Pro.`;
        reasoning = `${tool.toolName} is a specialized coding tool. For a writing-focused workflow, Claude Pro offers superior long-form generation and nuanced editing for $${claudePro.pricePerUserMonth}/user.`;
      }
    }

    // Rule 3: Redundancy (Cursor AND Copilot)
    if (useCase === "coding" && tool.toolName === "GitHub Copilot" && tools.some(t => t.toolName === "Cursor")) {
      recommendation = "switch";
      projectedMonthlyCost = 0;
      recommendedAction = "Drop GitHub Copilot and use Cursor exclusively.";
      reasoning = "Cursor includes its own deep integration and models. Running both is redundant; dropping Copilot saves the full subscription cost with no loss in power.";
    }

    // Rule 4: API Spend > $100
    if ((tool.toolName === "Anthropic API" || tool.toolName === "OpenAI API") && currentMonthlyCost > 100) {
      const vendorName = tool.toolName.startsWith("Anthropic") ? "Claude" : "ChatGPT";
      const teamPlan = PRICING_DATA[vendorName]?.find(p => p.name === "Team");
      if (teamPlan) {
        recommendation = "optimal"; 
        recommendedAction = `Evaluate switching API usage to the ${vendorName} Team plan.`;
        reasoning = `Your monthly API spend ($${currentMonthlyCost}) exceeds the cost of a Team plan for your size. A Team plan may offer better cost predictability and higher rate limits.`;
      }
    }

    const monthlySavings = Math.max(0, currentMonthlyCost - projectedMonthlyCost);
    const annualSavings = monthlySavings * 12;

    // Rule 5: Credex Note
    if (monthlySavings > 0) {
      reasoning += " Additionally, purchasing these seats through Credex can save you an extra 15–30% via enterprise credits.";
    }

    return {
      toolName: tool.toolName,
      currentPlan: tool.plan,
      currentMonthlyCost,
      recommendation,
      recommendedAction,
      projectedMonthlyCost,
      monthlySavings,
      annualSavings,
      reasoning
    };
  });

  const totalMonthlySavings = results.reduce((acc, curr) => acc + curr.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    hasHighSavings: totalMonthlySavings > 500
  };
}
