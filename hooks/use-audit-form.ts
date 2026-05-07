"use client";

import { useState, useEffect, useCallback } from "react";
import { ToolName, UseCase, UserTool } from "@/types/audit";
import { PRICING_DATA } from "@/lib/pricing-data";

export interface AuditFormState {
  step: 1 | 2 | 3;
  teamSize: number;
  useCase: UseCase;
  tools: Record<
    ToolName,
    {
      enabled: boolean;
      plan: string;
      seats: number;
      monthlySpend: number;
      manualSpend: boolean;
    }
  >;
}

const TOOL_NAMES: ToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Gemini",
  "Windsurf",
  "Anthropic API",
  "OpenAI API",
];

function buildDefaultTools(): AuditFormState["tools"] {
  const defaults = {} as AuditFormState["tools"];
  for (const name of TOOL_NAMES) {
    const plans = PRICING_DATA[name];
    const defaultPlan = plans[1] ?? plans[0]; // prefer the first paid plan
    defaults[name] = {
      enabled: false,
      plan: defaultPlan.name,
      seats: 1,
      monthlySpend: defaultPlan.pricePerUserMonth,
      manualSpend: false,
    };
  }
  return defaults;
}

const STORAGE_KEY = "spendlens-audit-form";

const DEFAULT_STATE: AuditFormState = {
  step: 1,
  teamSize: 1,
  useCase: "mixed",
  tools: buildDefaultTools(),
};

export function useAuditForm() {
  const [state, setState] = useState<AuditFormState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AuditFormState;
        setState(parsed);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every state change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [state, hydrated]);

  const setStep = useCallback((step: 1 | 2 | 3) => {
    setState((s) => ({ ...s, step }));
  }, []);

  const setTeamSize = useCallback((teamSize: number) => {
    setState((s) => ({ ...s, teamSize }));
  }, []);

  const setUseCase = useCallback((useCase: UseCase) => {
    setState((s) => ({ ...s, useCase }));
  }, []);

  const toggleTool = useCallback((name: ToolName, enabled: boolean) => {
    setState((s) => ({
      ...s,
      tools: { ...s.tools, [name]: { ...s.tools[name], enabled } },
    }));
  }, []);

  const setToolPlan = useCallback((name: ToolName, plan: string) => {
    setState((s) => {
      const toolState = s.tools[name];
      // Recalculate spend unless user has overridden it manually
      const planData = PRICING_DATA[name].find((p) => p.name === plan);
      const monthlySpend =
        toolState.manualSpend
          ? toolState.monthlySpend
          : (planData?.pricePerUserMonth ?? 0) * toolState.seats;
      return {
        ...s,
        tools: { ...s.tools, [name]: { ...toolState, plan, monthlySpend } },
      };
    });
  }, []);

  const setToolSeats = useCallback((name: ToolName, seats: number) => {
    setState((s) => {
      const toolState = s.tools[name];
      const planData = PRICING_DATA[name].find((p) => p.name === toolState.plan);
      const monthlySpend =
        toolState.manualSpend
          ? toolState.monthlySpend
          : (planData?.pricePerUserMonth ?? 0) * seats;
      return {
        ...s,
        tools: { ...s.tools, [name]: { ...toolState, seats, monthlySpend } },
      };
    });
  }, []);

  const setToolSpend = useCallback((name: ToolName, monthlySpend: number) => {
    setState((s) => ({
      ...s,
      tools: {
        ...s.tools,
        [name]: { ...s.tools[name], monthlySpend, manualSpend: true },
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Build the UserTool[] payload to send to the API
  const getEnabledTools = useCallback((): UserTool[] => {
    return TOOL_NAMES.filter((n) => state.tools[n].enabled).map((n) => ({
      toolName: n,
      plan: state.tools[n].plan,
      seats: state.tools[n].seats,
      monthlySpend: state.tools[n].monthlySpend,
    }));
  }, [state.tools]);

  return {
    state,
    hydrated,
    setStep,
    setTeamSize,
    setUseCase,
    toggleTool,
    setToolPlan,
    setToolSeats,
    setToolSpend,
    reset,
    getEnabledTools,
    TOOL_NAMES,
  };
}
