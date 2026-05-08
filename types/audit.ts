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

// ─── Input ────────────────────────────────────────────────────────────────────
export interface UserTool {
  toolName: ToolName;
  plan: string;
  seats: number;
  monthlySpend: number;
  /** Workflow tags selected by the user for this specific tool */
  workflows: WorkflowTag[];
}

// ─── Output ───────────────────────────────────────────────────────────────────
export type RecommendationType = "optimal" | "downgrade" | "switch" | "redundant";

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
  /** Detected workflow overlaps with other tools in the audit */
  workflowOverlaps?: string[];
}

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  hasHighSavings: boolean; // true if >$500/mo
  orgType: OrgType;
  teamSize: number;
}
