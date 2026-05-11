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
          "Downgrade to Free",
          0,
          `Light usage by 1 user is well within free tier limits. Drop the $${currentMonthlyCost}/mo paid plan to save immediately.`,
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
          `Switch to ${alt} for writing`,
          cost,
          `${tool.toolName} is built for code. ${alt} offers superior long-form editing and tone control for your writing-focused workflows at $${altPlan.pricePerUserMonth}/user.`,
          "high"
        );
      } else if ((tool.toolName === "Claude" || tool.toolName === "ChatGPT") && hasCoding && !hasWriting) {
        const isPremiumClaude = tool.toolName === "Claude" && (tool.plan === "Max" || tool.plan === "Team");
        
        if (!isPremiumClaude) {
          const alt = "Cursor";
          const altPlan = PRICING_DATA[alt].find(p => p.name === "Pro") || PRICING_DATA[alt][1];
          const cost = altPlan.pricePerUserMonth * tool.seats;
          setRecommendation(
            "switch",
            `Switch to ${alt} for coding`,
            cost,
            `You're using ${tool.toolName} for code, but it lacks the deep IDE integration and codebase context of ${alt}. Switching improves dev speed for just $${altPlan.pricePerUserMonth}/user.`,
            "high"
          );
        }
      }
    }

    // ── Rule 3: Plan tier vs team size + growth ───────────────────────────────
    if (result.recommendation === "optimal" && tool.seats <= 3 && (tool.plan.includes("Business") || tool.plan.includes("Team"))) {
      if (growthTrajectory === "scaling" || growthTrajectory === "hiring") {
        setRecommendation(
          "optimal",
          "Optimal for Growth",
          currentMonthlyCost,
          `Your ${tool.plan} plan is appropriate given your ${growthTrajectory} trajectory. Staying here avoids a disruptive migration when you hire more users in 2-3 months.`,
          "medium"
        );
      } else if (tool.usageIntensity === "heavy") {
        setRecommendation(
          "optimal",
          "Optimal for Heavy Usage",
          currentMonthlyCost,
          `Heavy usage by ${tool.seats} users justifies the ${tool.plan} tier. Advanced rate limits and priority support provide a clear ROI for power users.`,
          "medium"
        );
      } else {
        const proPlan = pricingPlans.find(p => p.name === "Pro" || p.name === "Individual" || p.name === "Plus");
        if (proPlan) {
          const cost = proPlan.pricePerUserMonth * tool.seats;
          setRecommendation(
            "downgrade",
            `Downgrade to ${proPlan.name}`,
            cost,
            `${tool.seats} users don't need enterprise features. Switching to ${proPlan.name} at $${proPlan.pricePerUserMonth}/user saves $${(currentMonthlyCost - cost).toFixed(0)}/mo without losing core AI power.`,
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
          `Downgrade to ${teamPlan.name}`,
          cost,
          `Enterprise tiers are for 100+ seats with complex compliance needs. At your scale, ${teamPlan.name} offers identical AI capabilities for $${(currentMonthlyCost - cost).toFixed(0)}/mo less.`,
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
            `Drop ${tool.toolName}`,
            0,
            `${replacementToolName} covers all your ${tool.workflows.join(", ")} workflows. Dropping ${tool.toolName} eliminates redundancy and saves the full $${currentMonthlyCost}/mo.`,
            "high",
            [
              `Migrate CI/CD or CLI usage to ${replacementToolName}`,
              `Verify team integration support in ${replacementToolName}`
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
          `Consolidate ${mostExpensiveOverlap.workflow} to ${cheaperToolName}`,
          currentMonthlyCost - myWorkflowCost,
          `You're spending $${myWorkflowCost.toFixed(0)}/mo on ${tool.toolName} for ${mostExpensiveOverlap.workflow} tasks that ${cheaperToolName} already handles cheaper. Consolidating work saves immediately.`,
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
          `Switch to ${vendorName} Team`,
          flatCost,
          `Your steady API spend ($${currentMonthlyCost}/mo) exceeds a flat Team plan cost. Switching provides predictable billing and higher limits for $${flatCost}/mo.`,
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
          `Trim to ${suggestedSeats} Seats`,
          cost,
          `You have ${tool.seats} seats for ${teamSize} members. Trimming to ${suggestedSeats} (includes buffer) saves $${(currentMonthlyCost - cost).toFixed(0)}/mo with zero impact on workflow.`,
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
            `Upgrade to ${teamTier.name}`,
            cost,
            `You're scaling fast. Upgrading now unlocks admin controls and volume pricing before you hit 15+ seats, avoiding a messy migration during peak growth.`,
            "medium"
          );
        }
      }
    }

    // ── Rule 12: Actually optimal ─────────────────────────────────────────────
    if (result.recommendation === "optimal" && !result.reasoning) {
      let reasoning = `${tool.toolName} ${tool.plan} at $${currentMonthlyCost}/mo is appropriate because your ${tool.seats} ${tool.usageIntensity}-usage seats justify this tier, it covers your ${tool.workflows.join(", ")} workflows with no significant redundancy, and it aligns with your ${growthTrajectory} growth trajectory.`;
      
      if (tool.toolName === "Claude" && (tool.plan === "Max" || tool.plan === "Team") && tool.workflows.includes("coding")) {
        reasoning = `Your Claude ${tool.plan} plan is ideal for your coding-centric workflows. Advanced features like Claude Code and higher rate limits provide a premium agentic experience that justifies the tier.`;
      }

      setRecommendation(
        "optimal",
        "Your current setup is well-matched.",
        currentMonthlyCost,
        reasoning,
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
