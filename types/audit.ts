export type ToolName =
  | "Cursor"
  | "GitHub Copilot"
  | "Claude"
  | "ChatGPT"
  | "Gemini"
  | "Windsurf"
  | "Anthropic API"
  | "OpenAI API";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface UserTool {
  toolName: ToolName;
  plan: string;
  seats: number;
  monthlySpend: number;
}

export type RecommendationType = "optimal" | "downgrade" | "switch" | "credits";

export interface AuditResult {
  toolName: ToolName;
  currentPlan: string;
  currentMonthlyCost: number;
  recommendation: RecommendationType;
  recommendedAction: string;
  projectedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;
}

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  hasHighSavings: boolean; // true if >$500/mo
}
