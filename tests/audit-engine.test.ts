import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/audit-engine";
import { UserTool, UseCase } from "@/types/audit";

describe("Audit Engine", () => {
  it("should recommend downgrade for Cursor Business with 2 seats", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Business", seats: 2, monthlySpend: 80 }
    ];
    const summary = runAudit(tools, 2, "coding");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("downgrade");
    expect(result.monthlySavings).toBe(40); // 80 - (20 * 2)
    expect(result.recommendedAction).toContain("Pro");
  });

  it("should recommend Individual plan for solo dev on Copilot Business", () => {
    const tools: UserTool[] = [
      { toolName: "GitHub Copilot", plan: "Business", seats: 1, monthlySpend: 19 }
    ];
    const summary = runAudit(tools, 1, "coding");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("downgrade");
    expect(result.monthlySavings).toBe(9); // 19 - 10
  });

  it("should flag redundancy when both Cursor and Copilot are used for coding", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Pro", seats: 1, monthlySpend: 20 },
      { toolName: "GitHub Copilot", plan: "Business", seats: 1, monthlySpend: 19 }
    ];
    const summary = runAudit(tools, 1, "coding");
    const copilotResult = summary.results.find(r => r.toolName === "GitHub Copilot");
    
    expect(copilotResult?.recommendation).toBe("switch");
    expect(copilotResult?.monthlySavings).toBe(19);
  });

  it("should suggest Claude Pro for writers using Cursor", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Pro", seats: 1, monthlySpend: 20 }
    ];
    const summary = runAudit(tools, 1, "writing");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("switch");
    expect(result.recommendedAction).toContain("Claude Pro");
  });

  it("should mark optimal when tools are on cheapest plans", () => {
    const tools: UserTool[] = [
      { toolName: "ChatGPT", plan: "Plus", seats: 1, monthlySpend: 20 }
    ];
    const summary = runAudit(tools, 1, "mixed");
    const result = summary.results[0];
    
    expect(result.recommendation).toBe("optimal");
    expect(result.monthlySavings).toBe(0);
  });

  it("should flag evaluation of Team plan for high API spend", () => {
    const tools: UserTool[] = [
      { toolName: "OpenAI API", plan: "API Usage", seats: 1, monthlySpend: 150 }
    ];
    const summary = runAudit(tools, 1, "coding");
    const result = summary.results[0];
    
    expect(result.recommendedAction).toContain("Team plan");
  });

  it("should correctly identify high savings (> $500)", () => {
    const tools: UserTool[] = [
      { toolName: "Cursor", plan: "Business", seats: 30, monthlySpend: 1200 }
    ];
    // If we downgrade 30 seats to Pro (not a rule for >3, but let's test a manual case)
    // Actually, rule 1 is only for <= 3. 
    // Let's create a scenario where savings are high.
    // Redundancy for a large team:
    const toolsHigh: UserTool[] = [
      { toolName: "Cursor", plan: "Pro", seats: 30, monthlySpend: 600 },
      { toolName: "GitHub Copilot", plan: "Business", seats: 30, monthlySpend: 570 }
    ];
    const summary = runAudit(toolsHigh, 30, "coding");
    expect(summary.totalMonthlySavings).toBe(570);
    expect(summary.hasHighSavings).toBe(true);
  });

  it("should return empty summary for no tools", () => {
    const summary = runAudit([], 0, "mixed");
    expect(summary.results.length).toBe(0);
    expect(summary.totalMonthlySavings).toBe(0);
  });
});
