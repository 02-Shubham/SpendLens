import { describe, it, expect } from "vitest";
import { runAudit } from "../lib/audit-engine";
import { UserTool } from "../types/audit";

describe("Audit Engine Smart Rules", () => {
  it("Rule 1: Single light user on Pro plan should recommend Free tier", () => {
    const tools: UserTool[] = [
      {
        toolName: "Claude",
        plan: "Pro",
        seats: 1,
        monthlySpend: 20,
        workflows: ["writing"],
        usageIntensity: "light",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 5, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("downgrade");
    expect(audit.results[0].projectedMonthlyCost).toBe(0);
    expect(audit.results[0].reasoning).toContain("free tier limits");
  });

  it("Rule 3: 3 heavy users on Team plan + scaling growth should stay optimal", () => {
    const tools: UserTool[] = [
      {
        toolName: "ChatGPT",
        plan: "Team",
        seats: 3,
        monthlySpend: 90,
        workflows: ["writing"],
        usageIntensity: "heavy",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 3, "saas", "scaling");
    expect(audit.results[0].recommendation).toBe("optimal");
    expect(audit.results[0].recommendedAction).toContain("positioned for growth");
  });

  it("Rule 5: Cursor + Copilot both for coding should drop Copilot with conditions", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        plan: "Pro",
        seats: 5,
        monthlySpend: 100,
        workflows: ["coding"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
      {
        toolName: "GitHub Copilot",
        plan: "Business",
        seats: 5,
        monthlySpend: 95,
        workflows: ["coding"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 5, "saas", "stable");
    const copilotResult = audit.results.find(r => r.toolName === "GitHub Copilot")!;
    expect(copilotResult.recommendation).toBe("redundant");
    expect(copilotResult.projectedMonthlyCost).toBe(0);
    expect(copilotResult.conditions?.length).toBeGreaterThan(0);
    expect(copilotResult.reasoning).toContain("covers all the same workflows");
  });

  it("Rule 6: Workflow overlap (Claude vs Cursor) should reallocate writing", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        plan: "Pro",
        seats: 4,
        monthlySpend: 80, // $20/seat, $10/workflow
        workflows: ["coding", "writing"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
      {
        toolName: "Claude",
        plan: "Free",
        seats: 4,
        monthlySpend: 0,
        workflows: ["writing"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    // Claude Free is cheaper for writing ($0 vs $40)
    const audit = runAudit(tools, 4, "saas", "stable");
    const cursorResult = audit.results.find(r => r.toolName === "Cursor")!;
    expect(cursorResult.recommendation).toBe("switch");
    expect(cursorResult.recommendedAction).toContain("Move writing workflows to Claude");
  });

  it("Rule 7: API spend $150/mo, team of 3 should recommend Team plan", () => {
    const tools: UserTool[] = [
      {
        toolName: "OpenAI API",
        plan: "API Usage",
        seats: 1,
        monthlySpend: 150,
        workflows: ["research"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    // ChatGPT Team is $30/seat * 3 = $90 < $150
    const audit = runAudit(tools, 3, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("switch");
    expect(audit.results[0].projectedMonthlyCost).toBe(90);
    expect(audit.results[0].recommendedAction).toContain("Switch to ChatGPT Team plan");
  });

  it("Rule 7: API spend $80/mo burst (2 months active) should stay on API, low confidence", () => {
    const tools: UserTool[] = [
      {
        toolName: "OpenAI API",
        plan: "API Usage",
        seats: 1,
        monthlySpend: 150,
        workflows: ["research"],
        usageIntensity: "moderate",
        monthsActive: 2,
      },
    ];
    const audit = runAudit(tools, 3, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("optimal");
    expect(audit.results[0].confidenceLevel).toBe("low");
    expect(audit.results[0].reasoning).toContain("waiting another 2 months");
  });

  it("Rule 8: 5 seats for 15-person team should recommend expanding seats", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        plan: "Pro",
        seats: 5,
        monthlySpend: 100,
        workflows: ["coding"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 15, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("expand");
    expect(audit.results[0].projectedMonthlyCost).toBeGreaterThan(100);
    expect(audit.results[0].reasoning).toContain("unlicensed usage");
  });

  it("Rule 9: 20 seats for 10-person stable team should recommend reducing seats", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        plan: "Pro",
        seats: 20,
        monthlySpend: 400,
        workflows: ["coding"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 10, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("downgrade");
    expect(audit.results[0].projectedMonthlyCost).toBe(220); // 11 seats * 20
    expect(audit.results[0].recommendedAction).toContain("Reduce seats to 11");
  });

  it("Rule 2: Cursor for writing only should switch to Claude", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        plan: "Pro",
        seats: 1,
        monthlySpend: 20,
        workflows: ["writing"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 5, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("switch");
    expect(audit.results[0].recommendedAction).toContain("Switch to Claude for writing workflows");
  });

  it("Rule 12: All tools already optimal should return all optimal with good reasoning", () => {
    const tools: UserTool[] = [
      {
        toolName: "Claude",
        plan: "Pro",
        seats: 5,
        monthlySpend: 100,
        workflows: ["writing"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];
    const audit = runAudit(tools, 5, "saas", "stable");
    expect(audit.results[0].recommendation).toBe("optimal");
    expect(audit.results[0].reasoning).toContain("appropriate because");
    expect(audit.results[0].reasoning.length).toBeGreaterThan(100);
  });
});
