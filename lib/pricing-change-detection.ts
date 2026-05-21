import { PricingPlan } from "@/lib/pricing-data";
import { AuditSummary, ToolName, UserTool } from "@/types/audit";

export type PricingChangeType =
  | "price_changed"
  | "plan_added"
  | "plan_removed"
  | "tool_added"
  | "tool_removed";

export interface PricingChange {
  toolName: string;
  planName: string;
  changeType: PricingChangeType;
  oldPrice: number | null;
  newPrice: number | null;
}

export interface RecommendationChange {
  toolName: ToolName;
  oldAction: string;
  newAction: string;
  oldMonthlySavings: number;
  newMonthlySavings: number;
}

export function detectPricingChanges(
  oldPricing: Record<string, PricingPlan[]>,
  newPricing: Record<string, PricingPlan[]>
): PricingChange[] {
  const changes: PricingChange[] = [];
  const toolNames = new Set([...Object.keys(oldPricing), ...Object.keys(newPricing)]);

  for (const toolName of toolNames) {
    const oldPlans = oldPricing[toolName];
    const newPlans = newPricing[toolName];

    if (!oldPlans && newPlans) {
      changes.push(
        ...newPlans.map((plan) => ({
          toolName,
          planName: plan.name,
          changeType: "tool_added" as const,
          oldPrice: null,
          newPrice: plan.pricePerUserMonth,
        }))
      );
      continue;
    }

    if (oldPlans && !newPlans) {
      changes.push(
        ...oldPlans.map((plan) => ({
          toolName,
          planName: plan.name,
          changeType: "tool_removed" as const,
          oldPrice: plan.pricePerUserMonth,
          newPrice: null,
        }))
      );
      continue;
    }

    if (!oldPlans || !newPlans) continue;

    const oldPlansByName = new Map(oldPlans.map((plan) => [plan.name, plan]));
    const newPlansByName = new Map(newPlans.map((plan) => [plan.name, plan]));
    const planNames = new Set([...oldPlansByName.keys(), ...newPlansByName.keys()]);

    for (const planName of planNames) {
      const oldPlan = oldPlansByName.get(planName);
      const newPlan = newPlansByName.get(planName);

      if (!oldPlan && newPlan) {
        changes.push({
          toolName,
          planName,
          changeType: "plan_added",
          oldPrice: null,
          newPrice: newPlan.pricePerUserMonth,
        });
        continue;
      }

      if (oldPlan && !newPlan) {
        changes.push({
          toolName,
          planName,
          changeType: "plan_removed",
          oldPrice: oldPlan.pricePerUserMonth,
          newPrice: null,
        });
        continue;
      }

      if (oldPlan && newPlan && oldPlan.pricePerUserMonth !== newPlan.pricePerUserMonth) {
        changes.push({
          toolName,
          planName,
          changeType: "price_changed",
          oldPrice: oldPlan.pricePerUserMonth,
          newPrice: newPlan.pricePerUserMonth,
        });
      }
    }
  }

  return changes;
}

export function filterChangesForStack(
  changes: PricingChange[],
  tools: UserTool[]
): PricingChange[] {
  const selectedTools = new Set(tools.map((tool) => tool.toolName));
  const selectedPlans = new Set(tools.map((tool) => `${tool.toolName}:${tool.plan}`));

  return changes.filter((change) => {
    if (!selectedTools.has(change.toolName as ToolName)) return false;
    if (change.changeType === "price_changed" || change.changeType === "plan_removed") {
      return selectedPlans.has(`${change.toolName}:${change.planName}`);
    }
    return true;
  });
}

export function findRecommendationChanges(
  oldSummary: AuditSummary,
  newSummary: AuditSummary
): RecommendationChange[] {
  return newSummary.results.flatMap((newResult) => {
    const oldResult = oldSummary.results.find(
      (result) => result.toolName === newResult.toolName
    );

    if (!oldResult) {
      return [{
        toolName: newResult.toolName,
        oldAction: "No previous recommendation",
        newAction: newResult.recommendedAction,
        oldMonthlySavings: 0,
        newMonthlySavings: newResult.monthlySavings,
      }];
    }

    const changed =
      oldResult.recommendation !== newResult.recommendation ||
      oldResult.recommendedAction !== newResult.recommendedAction ||
      oldResult.monthlySavings !== newResult.monthlySavings;

    if (!changed) return [];

    return [{
      toolName: newResult.toolName,
      oldAction: oldResult.recommendedAction,
      newAction: newResult.recommendedAction,
      oldMonthlySavings: oldResult.monthlySavings,
      newMonthlySavings: newResult.monthlySavings,
    }];
  });
}
