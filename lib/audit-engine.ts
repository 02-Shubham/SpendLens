import {
  UserTool,
  OrgType,
  AuditResult,
  AuditSummary,
  RecommendationType,
  WorkflowTag,
  ToolName,
  GrowthTrajectory,
} from "@/types/audit";
import { PRICING_DATA } from "./pricing-data";

// ─── Tool capability mappings ─────────────────────────────────────────

const TOOL_CAPABILITIES: Record<
  ToolName,
  {
    strengths: string[];
    primaryWorkflows: WorkflowTag[];
    covers: ToolName[]; // tools this one can replace
    coveredBy: ToolName[]; // tools that can replace this one
  }
> = {
  Cursor: {
    strengths: ["IDE integration", "multi-model", "codebase context"],
    primaryWorkflows: ["coding"],
    covers: ["GitHub Copilot", "Windsurf"],
    coveredBy: [],
  },
  "GitHub Copilot": {
    strengths: ["GitHub integration", "widespread adoption"],
    primaryWorkflows: ["coding"],
    covers: [],
    coveredBy: ["Cursor"],
  },
  Claude: {
    strengths: ["long context", "writing quality", "reasoning"],
    primaryWorkflows: ["writing", "research", "coding"],
    covers: ["ChatGPT"], // for writing/research only
    coveredBy: [],
  },
  ChatGPT: {
    strengths: ["general purpose", "plugins", "voice mode"],
    primaryWorkflows: ["writing", "support", "research"],
    covers: [],
    coveredBy: ["Claude"], // only for writing/research workflows
  },
  Gemini: {
    strengths: ["Google Workspace integration", "large context window"],
    primaryWorkflows: ["research", "data", "writing"],
    covers: [],
    coveredBy: ["Claude", "ChatGPT"],
  },
  Windsurf: {
    strengths: ["agentic capabilities", "speed"],
    primaryWorkflows: ["coding"],
    covers: ["GitHub Copilot"],
    coveredBy: ["Cursor"],
  },
  "Anthropic API": {
    strengths: ["high quality", "predictable pricing"],
    primaryWorkflows: ["coding", "writing", "research"],
    covers: ["OpenAI API"],
    coveredBy: [],
  },
  "OpenAI API": {
    strengths: ["ecosystem", "speed"],
    primaryWorkflows: ["support", "research"],
    covers: [],
    coveredBy: ["Anthropic API"],
  },
};

const CODING_TOOLS = new Set<ToolName>(["Cursor", "GitHub Copilot", "Windsurf"]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const IS_API_TOOL = (name: ToolName) =>
  name === "Anthropic API" || name === "OpenAI API";


function calculateCostPerWorkflow(
  tool: UserTool
): Record<WorkflowTag, number> {
  const numWorkflows = Math.max(1, tool.workflows.length);
  const costPerWorkflow = tool.monthlySpend / numWorkflows;

  return tool.workflows.reduce((acc, w) => {
    acc[w] = costPerWorkflow;
    return acc;
  }, {} as Record<WorkflowTag, number>);
}

function findWorkflowOverlaps(
  tool: UserTool,
  allTools: UserTool[]
): { workflow: WorkflowTag; tools: ToolName[]; totalCost: number }[] {
  const overlaps: { workflow: WorkflowTag; tools: ToolName[]; totalCost: number }[] = [];

  for (const workflow of tool.workflows) {
    const overlappingTools = allTools.filter(
      (t) => t.toolName !== tool.toolName && t.workflows.includes(workflow)
    );

    if (overlappingTools.length > 0) {
      const totalCost = overlappingTools.reduce(
        (sum, t) => sum + (calculateCostPerWorkflow(t)[workflow] || 0),
        calculateCostPerWorkflow(tool)[workflow] || 0
      );

      overlaps.push({
        workflow,
        tools: overlappingTools.map((t) => t.toolName),
        totalCost,
      });
    }
  }

  return overlaps;
}

function analyzeAPIPattern(tool: UserTool): {
  pattern: "burst" | "steady" | "growing";
  breakEvenSeats: number;
} {
  const pattern = !tool.monthsActive || tool.monthsActive < 3 
    ? "burst" 
    : "steady";

  const vendorName: ToolName = tool.toolName.includes("Anthropic") ? "Claude" : "ChatGPT";
  const teamPlan = PRICING_DATA[vendorName]?.find((p) => p.name === "Team");

  const breakEvenSeats = teamPlan 
    ? Math.ceil(tool.monthlySpend / teamPlan.pricePerUserMonth)
    : 999;

  return { pattern, breakEvenSeats };
}

// ─── Main function ────────────────────────────────────────────────────────────

export function runAudit(
  tools: UserTool[],
  teamSize: number,
  orgType: OrgType,
  growthTrajectory: GrowthTrajectory = "stable"
): AuditSummary {
  const results: AuditResult[] = tools.map((tool) => {
    const pricingPlans = PRICING_DATA[tool.toolName];
    const currentMonthlyCost = tool.monthlySpend || 0;

    const result: Partial<AuditResult> = {
      toolName: tool.toolName,
      currentPlan: tool.plan,
      currentMonthlyCost,
      recommendation: "optimal",
      recommendedAction: "Your current setup is well-matched.",
      projectedMonthlyCost: currentMonthlyCost,
      confidenceLevel: "high",
    };

    const setRecommendation = (
      rec: RecommendationType,
      action: string,
      projectedCost: number,
      reason: string,
      confidence: "high" | "medium" | "low" = "high",
      conditions?: string[]
    ) => {
      result.recommendation = rec;
      result.recommendedAction = action;
      result.projectedMonthlyCost = projectedCost;
      result.reasoning = reason;
      result.confidenceLevel = confidence;
      result.conditions = conditions;
    };

    // ── Rule 1: Free tier eligibility ─────────────────────────────────────────
    if (tool.plan !== "Free" && tool.seats === 1 && tool.usageIntensity === "light") {
      const freePlan = pricingPlans.find((p) => p.name === "Free" || p.name === "Hobby");
      if (freePlan) {
        setRecommendation(
          "downgrade",
          `Downgrade to the Free plan — light usage by 1 user doesn't justify $${currentMonthlyCost}/mo`,
          0,
          `Single-user light usage is well within free tier limits for ${tool.toolName}. You are currently paying $${currentMonthlyCost}/mo for features that are likely available for free at your scale.`,
          "high"
        );
      }
    }

    // ── Rule 2: Mismatched tool for workflows ─────────────────────────────────
    if (result.recommendation === "optimal") {
      const isCodingTool = CODING_TOOLS.has(tool.toolName);
      const hasWriting = tool.workflows.includes("writing");
      const hasCoding = tool.workflows.includes("coding");

      if (isCodingTool && hasWriting && !hasCoding) {
        const alt = "Claude";
        const altPlan = PRICING_DATA[alt].find(p => p.name === "Pro") || PRICING_DATA[alt][1];
        const cost = altPlan.pricePerUserMonth * tool.seats;
        setRecommendation(
          "switch",
          `Switch to ${alt} for writing workflows`,
          cost,
          `${tool.toolName} is optimized for code autocomplete and IDE integration. For your writing-focused workflows, ${alt} offers superior long-form editing, nuanced tone control, and better context retention at $${altPlan.pricePerUserMonth}/user. This swap maintains utility while improving output quality.`,
          "high"
        );
      } else if ((tool.toolName === "Claude" || tool.toolName === "ChatGPT") && hasCoding && !hasWriting) {
        const alt = "Cursor";
        const altPlan = PRICING_DATA[alt].find(p => p.name === "Pro") || PRICING_DATA[alt][1];
        const cost = altPlan.pricePerUserMonth * tool.seats;
        setRecommendation(
          "switch",
          `Switch to ${alt} for coding workflows`,
          cost,
          `You are using ${tool.toolName} primarily for coding, but it lacks the deep IDE integration and codebase-wide context that a dedicated tool like ${alt} provides. Switching would give your team better autocomplete and refactoring tools for $${altPlan.pricePerUserMonth}/user.`,
          "high"
        );
      }
    }

    // ── Rule 3: Plan tier vs team size + growth ───────────────────────────────
    if (result.recommendation === "optimal" && tool.seats <= 3 && (tool.plan.includes("Business") || tool.plan.includes("Team"))) {
      if (growthTrajectory === "scaling" || growthTrajectory === "hiring") {
        setRecommendation(
          "optimal",
          `Keep ${tool.plan} — you're positioned for growth`,
          currentMonthlyCost,
          `You have ${tool.seats} seats on the ${tool.plan} plan which usually requires more users, but since you are ${growthTrajectory}, staying on this tier avoids a disruptive migration in 2-3 months. The administrative overhead of switching now outweighs the short-term savings.`,
          "medium"
        );
      } else if (tool.usageIntensity === "heavy") {
        setRecommendation(
          "optimal",
          `Keep ${tool.plan} — high intensity justifies tier`,
          currentMonthlyCost,
          `Heavy-intensity users justify the ${tool.plan} tier even at a low seat count of ${tool.seats}. The advanced features like higher rate limits, SSO, and priority support provide a clear ROI for power users on your team.`,
          "medium"
        );
      } else {
        const proPlan = pricingPlans.find(p => p.name === "Pro" || p.name === "Individual" || p.name === "Plus");
        if (proPlan) {
          const cost = proPlan.pricePerUserMonth * tool.seats;
          setRecommendation(
            "downgrade",
            `Downgrade to ${proPlan.name} — ${tool.seats} seats don't need enterprise features`,
            cost,
            `You are paying for the ${tool.plan} tier for only ${tool.seats} users with ${tool.usageIntensity} usage. Switching to ${proPlan.name} at $${proPlan.pricePerUserMonth}/user saves $${(currentMonthlyCost - cost).toFixed(0)}/mo without losing core AI capabilities.`,
            "high"
          );
        }
      }
    }

    // ── Rule 4: Enterprise plan without enterprise needs ──────────────────────
    if (result.recommendation === "optimal" && tool.plan.includes("Enterprise") && tool.seats < 50) {
      const teamPlan = pricingPlans.find(p => p.name === "Team" || p.name === "Business");
      if (teamPlan) {
        const cost = teamPlan.pricePerUserMonth * tool.seats;
        setRecommendation(
          "downgrade",
          "Downgrade to Business or Team plan",
          cost,
          `Enterprise plans are built for 100+ seat organizations with complex SSO, compliance, and dedicated support needs. At your current scale of ${tool.seats} seats, a ${teamPlan.name} plan offers identical AI capabilities at a fraction of the cost, saving you $${(currentMonthlyCost - cost).toFixed(0)}/mo.`,
          "high"
        );
      }
    }

    // ── Rule 5: Strict redundancy ─────────────────────────────────────────────
    if (result.recommendation === "optimal") {
      const capabilities = TOOL_CAPABILITIES[tool.toolName];
      const replacementToolName = capabilities.coveredBy.find(name => 
        tools.some(t => t.toolName === name)
      );

      if (replacementToolName) {
        const replacement = tools.find(t => t.toolName === replacementToolName)!;
        const allWorkflowsCovered = tool.workflows.every(w => replacement.workflows.includes(w));
        
        if (allWorkflowsCovered) {
          setRecommendation(
            "redundant",
            `Drop ${tool.toolName} — ${replacementToolName} covers all the same workflows`,
            0,
            `Both ${tool.toolName} and ${replacementToolName} provide ${tool.workflows.join(", ")} capabilities for your team. Running both is redundant. ${replacementToolName} covers all the same workflows and its specific strengths in ${TOOL_CAPABILITIES[replacementToolName].strengths.join(", ")} make it the stronger single choice for your stack. Dropping ${tool.toolName} eliminates the full $${currentMonthlyCost}/mo cost.`,
            "high",
            [
              `First migrate any CI/CD scripts or local tools using ${tool.toolName}'s CLI`,
              `Ensure ${replacementToolName} supports all required team integrations`
            ]
          );
        }
      }
    }

    // ── Rule 6: Partial redundancy (workflow overlap) ─────────────────────────
    if (result.recommendation === "optimal") {
      const overlaps = findWorkflowOverlaps(tool, tools);
      const mostExpensiveOverlap = overlaps.find(o => {
        const myCost = calculateCostPerWorkflow(tool)[o.workflow];
        return o.tools.some(otherName => {
          const other = tools.find(t => t.toolName === otherName)!;
          return calculateCostPerWorkflow(other)[o.workflow] < myCost;
        });
      });

      if (mostExpensiveOverlap) {
        const cheaperToolName = mostExpensiveOverlap.tools[0]; // Simplified for logic
        const myWorkflowCost = calculateCostPerWorkflow(tool)[mostExpensiveOverlap.workflow];
        setRecommendation(
          "switch",
          `Move ${mostExpensiveOverlap.workflow} workflows to ${cheaperToolName}`,
          currentMonthlyCost - myWorkflowCost,
          `You're effectively spending $${myWorkflowCost.toFixed(0)}/mo on ${tool.toolName} specifically for ${mostExpensiveOverlap.workflow} tasks. ${cheaperToolName} already covers this workflow in your stack at a lower effective cost. Consolidating ${mostExpensiveOverlap.workflow} work into ${cheaperToolName} allows you to potentially downgrade ${tool.toolName} in the future.`,
          "medium"
        );
      }
    }

    // ── Rule 7: API spend vs flat plan arbitrage ──────────────────────────────
    if (result.recommendation === "optimal" && IS_API_TOOL(tool.toolName)) {
      const { pattern, breakEvenSeats } = analyzeAPIPattern(tool);
      if (pattern === "burst") {
        setRecommendation(
          "optimal",
          "Your current API setup is well-matched.",
          currentMonthlyCost,
          `Your API spend spiked recently to $${currentMonthlyCost}/mo. Since you've only been active for ${tool.monthsActive} months, we recommend waiting another 2 months to confirm this is sustained usage before locking into a flat Team plan.`,
          "low"
        );
      } else if (breakEvenSeats >= teamSize) {
        const vendorName: ToolName = tool.toolName.includes("Anthropic") ? "Claude" : "ChatGPT";
        const teamPlan = PRICING_DATA[vendorName].find(p => p.name === "Team")!;
        const flatCost = teamPlan.pricePerUserMonth * teamSize;
        setRecommendation(
          "switch",
          `Switch to ${vendorName} Team plan — API spend exceeds flat cost`,
          flatCost,
          `You have a steady API spend of $${currentMonthlyCost}/mo. A ${vendorName} Team plan at $${teamPlan.pricePerUserMonth}/seat × ${teamSize} users = $${flatCost}/mo provides predictable billing, higher rate limits, and administrative controls that your current pay-as-you-go model lacks.`,
          "high"
        );
      } else {
        setRecommendation(
          "optimal",
          "Your current API setup is well-matched.",
          currentMonthlyCost,
          `Pay-as-you-go is still the most efficient choice for your ${tool.toolName} usage. A flat Team plan for your ${teamSize} users would cost $${(PRICING_DATA[tool.toolName.includes("Anthropic") ? "Claude" : "ChatGPT"].find(p => p.name === "Team")?.pricePerUserMonth || 0) * teamSize}/mo, which is higher than your current spend.`,
          "high"
        );
      }
    }

    // ── Rule 9: Seat utilization (overbuying) ─────────────────────────────────
    if (result.recommendation === "optimal" && !result.reasoning && !IS_API_TOOL(tool.toolName) && tool.seats > teamSize * 1.5 && growthTrajectory === "stable") {
      const suggestedSeats = Math.ceil(teamSize * 1.1);
      const planData = pricingPlans.find(p => p.name === tool.plan);
      if (planData) {
        const cost = planData.pricePerUserMonth * suggestedSeats;
        setRecommendation(
          "downgrade",
          `Reduce seats to ${suggestedSeats}`,
          cost,
          `You are paying for ${tool.seats} seats but only have ${teamSize} team members. Given your stable growth trajectory, you are over-provisioned by ${Math.round(((tool.seats/teamSize)-1)*100)}%. Trimming to ${suggestedSeats} seats (including a 10% buffer) saves $${(currentMonthlyCost - cost).toFixed(0)}/mo.`,
          "high"
        );
      }
    }

    // ── Rule 11: Growth trajectory + seat planning ────────────────────────────
    if (result.recommendation === "optimal" && !result.reasoning && growthTrajectory === "scaling" && tool.seats < 10) {
      if (tool.plan.includes("Business") || tool.plan.includes("Team")) {
        setRecommendation(
          "optimal",
          "Your current setup is well-matched.",
          currentMonthlyCost,
          `You're currently on the ${tool.plan} plan with ${tool.seats} seats. While small, this is appropriate for your ${growthTrajectory} trajectory, as it positions you for seamless scaling without needing a tier migration later.`,
          "medium"
        );
      } else {
        const teamTier = pricingPlans.find(p => p.name === "Team" || p.name === "Business");
        if (teamTier) {
          const cost = teamTier.pricePerUserMonth * tool.seats;
          setRecommendation(
            "upgrade",
            `Upgrade to ${teamTier.name} now`,
            cost,
            `You are on an individual/pro plan but scaling fast. Upgrading to the ${teamTier.name} tier now unlocks administrative controls, centralized billing, and volume pricing before you hit 15+ seats, avoiding a disruptive migration during a high-growth phase.`,
            "medium",
            [`Plan to migrate when you reach 8-10 active users to minimize disruption.`]
          );
        }
      }
    }

    // ── Rule 12: Actually optimal ─────────────────────────────────────────────
    if (result.recommendation === "optimal" && !result.reasoning) {
      setRecommendation(
        "optimal",
        "Your current setup is well-matched.",
        currentMonthlyCost,
        `${tool.toolName} ${tool.plan} at $${currentMonthlyCost}/mo is appropriate because your ${tool.seats} ${tool.usageIntensity}-usage seats justify this tier, it covers your ${tool.workflows.join(", ")} workflows with no significant redundancy, and it aligns with your ${growthTrajectory} growth trajectory.`,
        "high"
      );
    }

    return {
      ...result,
      monthlySavings: Math.max(0, currentMonthlyCost - result.projectedMonthlyCost!),
      annualSavings: Math.max(0, currentMonthlyCost - result.projectedMonthlyCost!) * 12,
    } as AuditResult;
  });

  const totalMonthlySavings = results.reduce((acc, r) => acc + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const insights: string[] = [];

  // ── Cross-tool Insights ─────────────────────────────────────────────────────

  // Total workflow overlap cost
  const allOverlaps = tools.flatMap((t) => findWorkflowOverlaps(t, tools));
  if (allOverlaps.length > 0) {
    const totalOverlapCost = allOverlaps.reduce((sum, o) => sum + o.totalCost, 0);
    insights.push(
      `You have ${allOverlaps.length} workflow overlaps across tools, costing $${totalOverlapCost.toFixed(0)}/mo. Consolidation opportunities exist to trim your stack.`
    );
  }

  // Coding tool sprawl
  const codingToolsCount = tools.filter((t) => t.workflows.includes("coding")).length;
  if (codingToolsCount > 2) {
    insights.push(
      `Your team uses ${codingToolsCount} different coding assistants. Consider standardizing on 1-2 tools to reduce context switching and training overhead.`
    );
  }

  // High API spend with no caching
  const apiTools = tools.filter((t) => IS_API_TOOL(t.toolName));
  const totalAPISpend = apiTools.reduce((sum, t) => sum + t.monthlySpend, 0);
  if (totalAPISpend > 300) {
    insights.push(
      `Total API spend is $${totalAPISpend}/mo. Implementing prompt caching and response deduplication could reduce this by 15-25% without changing your tools.`
    );
  }

  // Rule 10 style insight added here manually for heavy API
  apiTools.forEach(t => {
    if (t.monthlySpend > 200 && t.usageIntensity === "heavy") {
      const potential = t.monthlySpend * 0.2;
      insights.push(
        `Heavy API usage on ${t.toolName} ($${t.monthlySpend}/mo) suggests opportunity for prompt caching. A 20% cache hit rate would save ~$${potential.toFixed(0)}/mo.`
      );
    }
  });

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings,
    hasHighSavings: totalMonthlySavings > 10,
    orgType,
    teamSize,
    growthTrajectory,
    insights,
  };
}
