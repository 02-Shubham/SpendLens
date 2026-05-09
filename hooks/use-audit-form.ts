"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolName, OrgType, UserTool, WorkflowTag } from "@/types/audit";
import { PRICING_DATA } from "@/lib/pricing-data";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolEntry {
  /** Stable React key */
  id: string;
  toolName: ToolName;
  plan: string;
  seats: number;
  /** Auto-calculated from plan × seats */
  monthlySpend: number;
  workflows: WorkflowTag[];
  /** Whether the card is in "edit" mode (expanded) or collapsed */
  isEditing: boolean;
}

export interface AuditFormState {
  step: 1 | 2 | 3;
  teamSize: number;
  orgType: OrgType;
  tools: ToolEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const TOOL_NAMES: ToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Gemini",
  "Windsurf",
  "Anthropic API",
  "OpenAI API",
];

const STORAGE_KEY = "spendlens-v2-audit-form";

const DEFAULT_STATE: AuditFormState = {
  step: 1,
  teamSize: 5,
  orgType: "saas",
  tools: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcSpend(toolName: ToolName, plan: string, seats: number): number {
  const planData = PRICING_DATA[toolName].find((p) => p.name === plan);
  if (!planData) return 0;
  const isApiTool = toolName === "Anthropic API" || toolName === "OpenAI API";
  return isApiTool ? 0 : planData.pricePerUserMonth * seats;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuditForm() {
  const [formState, setFormState] = useState<{
    data: AuditFormState;
    hydrated: boolean;
  }>({
    data: DEFAULT_STATE,
    hydrated: false,
  });

  // Hydrate from localStorage once on mount
  useEffect(() => {
    let savedData = DEFAULT_STATE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        savedData = JSON.parse(saved) as AuditFormState;
      }
    } catch {
      // ignore parse errors
    }
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setFormState(prev => ({
        ...prev,
        data: savedData,
        hydrated: true,
      }));
    }, 0);
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (!formState.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState.data));
    } catch {
      // ignore
    }
  }, [formState.data, formState.hydrated]);

  const state = formState.data;
  const hydrated = formState.hydrated;

  const setState = useCallback(
    (value: AuditFormState | ((s: AuditFormState) => AuditFormState)) => {
      setFormState((prev) => ({
        ...prev,
        data: typeof value === "function" ? value(prev.data) : value,
      }));
    },
    []
  );

  // ── Navigation ──────────────────────────────────────────────────────────────

  const setStep = useCallback((step: 1 | 2 | 3) => {
    setState((s) => ({ ...s, step }));
  }, [setState]);

  const setTeamSize = useCallback((teamSize: number) => {
    setState((s) => ({ ...s, teamSize }));
  }, [setState]);

  const setOrgType = useCallback((orgType: OrgType) => {
    setState((s) => ({ ...s, orgType }));
  }, [setState]);

  // ── Tool management ──────────────────────────────────────────────────────────

  /** Add a new blank tool entry (in edit mode) */
  const addTool = useCallback((toolName: ToolName = "ChatGPT") => {
    const plans = PRICING_DATA[toolName];
    const defaultPlan = plans[1] ?? plans[0];
    const entry: ToolEntry = {
      id: makeId(),
      toolName,
      plan: defaultPlan.name,
      seats: 1,
      monthlySpend: calcSpend(toolName, defaultPlan.name, 1),
      workflows: [],
      isEditing: true,
    };
    setState((s) => ({ ...s, tools: [...s.tools, entry] }));
  }, [setState]);

  /** Remove a tool entry by id */
  const removeTool = useCallback((id: string) => {
    setState((s) => ({ ...s, tools: s.tools.filter((t) => t.id !== id) }));
  }, [setState]);

  /** Partial update for a tool entry (recalculates spend when plan/seats change) */
  const updateTool = useCallback(
    (id: string, patch: Partial<Omit<ToolEntry, "id" | "monthlySpend">>) => {
      setState((s) => ({
        ...s,
        tools: s.tools.map((t) => {
          if (t.id !== id) return t;
          const next = { ...t, ...patch };
          // Recalculate spend unless it's an API tool
          const isApiTool =
            next.toolName === "Anthropic API" ||
            next.toolName === "OpenAI API";
          if (!isApiTool) {
            next.monthlySpend = calcSpend(next.toolName, next.plan, next.seats);
          }
          return next;
        }),
      }));
    },
    [setState]
  );

  /** Override monthly spend manually (for API tools) */
  const setToolSpend = useCallback((id: string, monthlySpend: number) => {
    setState((s) => ({
      ...s,
      tools: s.tools.map((t) => (t.id === id ? { ...t, monthlySpend } : t)),
    }));
  }, [setState]);

  /** Toggle a workflow tag for a tool */
  const toggleWorkflow = useCallback((id: string, tag: WorkflowTag) => {
    setState((s) => ({
      ...s,
      tools: s.tools.map((t) => {
        if (t.id !== id) return t;
        const has = t.workflows.includes(tag);
        return {
          ...t,
          workflows: has
            ? t.workflows.filter((w) => w !== tag)
            : [...t.workflows, tag],
        };
      }),
    }));
  }, [setState]);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [setState]);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const totalMonthlySpend = state.tools.reduce(
    (sum, t) => sum + t.monthlySpend,
    0
  );

  /** Build the UserTool[] payload to send to the API */
  const getToolsPayload = useCallback((): UserTool[] => {
    return state.tools.map((t) => ({
      toolName: t.toolName,
      plan: t.plan,
      seats: t.seats,
      monthlySpend: t.monthlySpend,
      workflows: t.workflows,
    }));
  }, [state.tools]);

  return {
    state,
    hydrated,
    totalMonthlySpend,
    setStep,
    setTeamSize,
    setOrgType,
    addTool,
    removeTool,
    updateTool,
    setToolSpend,
    toggleWorkflow,
    reset,
    getToolsPayload,
    TOOL_NAMES,
  };
}
