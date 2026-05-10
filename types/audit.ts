// ─── Tool names ────────────────────────────────────────────────────────────────
export type ToolName =
  | "Cursor"
  | "GitHub Copilot"
  | "Claude"
  | "ChatGPT"
  | "Gemini"
  | "Windsurf"
  | "Anthropic API"
  | "OpenAI API";

// ─── Workflow tags (per-tool, multi-select) ────────────────────────────────────
export type WorkflowTag =
  | "writing"
  | "coding"
  | "data"
  | "research"
  | "support"
  | "meetings"
  | "design"
  | "brainstorming";

// ─── Org type (metadata/personalization only — not core audit logic) ───────────
export type OrgType =
  | "saas"
  | "agency"
  | "internal"
  | "research"
  | "marketing"
  | "mixed";

export type GrowthTrajectory = "stable" | "hiring" | "scaling";

// ─── Input ────────────────────────────────────────────────────────────────────
export interface UserTool {
  toolName: ToolName;
  plan: string;
  seats: number;
  monthlySpend: number;
  /** Workflow tags selected by the user for this specific tool */
  workflows: WorkflowTag[];
  usageIntensity: "light" | "moderate" | "heavy";
  monthsActive: number;
}

// ─── Output ───────────────────────────────────────────────────────────────────
export type RecommendationType = "optimal" | "downgrade" | "switch" | "redundant" | "expand" | "upgrade";

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
  workflowOverlaps?: string[];
  conditions?: string[]; // NEW: blockers or prerequisites
  confidenceLevel?: "high" | "medium" | "low"; // NEW: how sure we are
}

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  hasHighSavings: boolean; // true if >$500/mo
  orgType: OrgType;
  teamSize: number;
  growthTrajectory: GrowthTrajectory; // NEW
  insights?: string[]; // NEW: top-level insights across all tools
}
