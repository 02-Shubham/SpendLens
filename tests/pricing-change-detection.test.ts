import { describe, expect, it } from "vitest";
import {
  detectPricingChanges,
  filterChangesForStack,
  findRecommendationChanges,
} from "../lib/pricing-change-detection";
import { AuditSummary, UserTool } from "../types/audit";

describe("pricing change detection", () => {
  it("detects price changes, added plans, and removed plans", () => {
    const changes = detectPricingChanges(
      {
        Cursor: [
          { name: "Hobby", pricePerUserMonth: 0 },
          { name: "Pro", pricePerUserMonth: 20 },
          { name: "Teams", pricePerUserMonth: 40 },
        ],
      },
      {
        Cursor: [
          { name: "Hobby", pricePerUserMonth: 0 },
          { name: "Pro", pricePerUserMonth: 25 },
          { name: "Business", pricePerUserMonth: 45 },
        ],
      }
    );

    expect(changes).toEqual([
      {
        toolName: "Cursor",
        planName: "Pro",
        changeType: "price_changed",
        oldPrice: 20,
        newPrice: 25,
      },
      {
        toolName: "Cursor",
        planName: "Teams",
        changeType: "plan_removed",
        oldPrice: 40,
        newPrice: null,
      },
      {
        toolName: "Cursor",
        planName: "Business",
        changeType: "plan_added",
        oldPrice: null,
        newPrice: 45,
      },
    ]);
  });

  it("filters price changes to the user stack and selected plan", () => {
    const tools: UserTool[] = [
      {
        toolName: "Cursor",
        plan: "Pro",
        seats: 2,
        monthlySpend: 40,
        workflows: ["coding"],
        usageIntensity: "moderate",
        monthsActive: 6,
      },
    ];

    const filtered = filterChangesForStack(
      [
        {
          toolName: "Cursor",
          planName: "Pro",
          changeType: "price_changed",
          oldPrice: 20,
          newPrice: 25,
        },
        {
          toolName: "Cursor",
          planName: "Enterprise",
          changeType: "price_changed",
          oldPrice: 60,
          newPrice: 80,
        },
        {
          toolName: "Claude",
          planName: "Pro",
          changeType: "price_changed",
          oldPrice: 17,
          newPrice: 20,
        },
      ],
      tools
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].planName).toBe("Pro");
  });

  it("detects recommendation changes between old and new audit summaries", () => {
    const oldSummary = summary("Keep Cursor Pro", 0);
    const newSummary = summary("Switch to GitHub Copilot Pro", 15);

    const changes = findRecommendationChanges(oldSummary, newSummary);

    expect(changes).toEqual([
      {
        toolName: "Cursor",
        oldAction: "Keep Cursor Pro",
        newAction: "Switch to GitHub Copilot Pro",
        oldMonthlySavings: 0,
        newMonthlySavings: 15,
      },
    ]);
  });
});

function summary(action: string, monthlySavings: number): AuditSummary {
  return {
    results: [
      {
        toolName: "Cursor",
        currentPlan: "Pro",
        currentMonthlyCost: 40,
        recommendation: monthlySavings > 0 ? "switch" : "optimal",
        recommendedAction: action,
        projectedMonthlyCost: 40 - monthlySavings,
        monthlySavings,
        annualSavings: monthlySavings * 12,
        reasoning: "Test summary",
      },
    ],
    totalMonthlySavings: monthlySavings,
    totalAnnualSavings: monthlySavings * 12,
    hasHighSavings: monthlySavings > 10,
    orgType: "saas",
    teamSize: 2,
    growthTrajectory: "stable",
  };
}
