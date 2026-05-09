import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/audit-engine";
import { UserTool, OrgType } from "@/types/audit";

describe("Audit Engine", () => {
  it("should recommend downgrade for Cursor Business with 2 seats", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Business", seats: 2, monthlySpend: 80, workflows: ["coding"] }
    ];
    const summary = runAudit(tools, 2, "saas");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("downgrade");
    expect(result.monthlySavings).toBe(40); // 80 - (20 * 2)
    expect(result.recommendedAction).toContain("Pro");
  });

  it("should recommend Individual plan for solo dev on Copilot Business", () => {
    const tools: UserTool[] = [
      { toolName: "GitHub Copilot", plan: "Business", seats: 1, monthlySpend: 19, workflows: ["coding"] }
    ];
    const summary = runAudit(tools, 1, "saas");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("downgrade");
    expect(result.monthlySavings).toBe(9); // 19 - 10
  });

  it("should flag redundancy when both Cursor and Copilot are used for coding", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Pro", seats: 1, monthlySpend: 20, workflows: ["coding"] },
      { toolName: "GitHub Copilot", plan: "Business", seats: 1, monthlySpend: 19, workflows: ["coding"] }
    ];
    const summary = runAudit(tools, 1, "saas");
    const copilotResult = summary.results.find(r => r.toolName === "GitHub Copilot");
    
    expect(copilotResult?.recommendation).toBe("redundant");
    expect(copilotResult?.monthlySavings).toBe(19);
  });

  it("should suggest Claude Pro for writers using Cursor", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Pro", seats: 1, monthlySpend: 20, workflows: ["writing"] }
    ];
    const summary = runAudit(tools, 1, "saas");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("switch");
    expect(result.recommendedAction).toContain("Claude Pro");
  });

  it("should mark optimal when tools are on cheapest plans", () => {
    const tools: UserTool[] = [
      { toolName: "ChatGPT", plan: "Plus", seats: 1, monthlySpend: 20, workflows: ["research"] }
    ];
    const summary = runAudit(tools, 1, "mixed" as OrgType);
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("optimal");
    expect(result.monthlySavings).toBe(0);
  });

  it("should flag evaluation of Team plan for high API spend", () => {
    const tools: UserTool[] = [
      { toolName: "OpenAI API", plan: "API Usage", seats: 1, monthlySpend: 200, workflows: [] }
    ];
    const summary = runAudit(tools, 5, "saas"); // Rule 4 checks teamSize
    const result = summary.results[0];
    
    expect(result.recommendedAction).toContain("Team plan");
  });

  it("should correctly identify high savings (> $500)", () => {
    // Redundancy for a large team:
    const toolsHigh: UserTool[] = [
      { toolName: "Cursor", plan: "Pro", seats: 30, monthlySpend: 600, workflows: ["coding"] },
      { toolName: "GitHub Copilot", plan: "Business", seats: 30, monthlySpend: 570, workflows: ["coding"] }
    ];
    const summary = runAudit(toolsHigh, 30, "saas");
    expect(summary.totalMonthlySavings).toBe(570);
    expect(summary.hasHighSavings).toBe(true);
  });

  it("should return empty summary for no tools", () => {
    const summary = runAudit([], 0, "mixed" as OrgType);
    expect(summary.results.length).toBe(0);
    expect(summary.totalMonthlySavings).toBe(0);
  });
});
