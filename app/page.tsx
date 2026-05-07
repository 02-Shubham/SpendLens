"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuditForm } from "@/hooks/use-audit-form";
import { PRICING_DATA } from "@/lib/pricing-data";
import { ToolName, UseCase } from "@/types/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Tool icon colours — simple coloured initials, no external requests
const TOOL_COLORS: Record<ToolName, string> = {
  Cursor: "bg-blue-100 text-blue-700",
  "GitHub Copilot": "bg-gray-100 text-gray-700",
  Claude: "bg-orange-100 text-orange-700",
  ChatGPT: "bg-green-100 text-green-700",
  Gemini: "bg-purple-100 text-purple-700",
  Windsurf: "bg-cyan-100 text-cyan-700",
  "Anthropic API": "bg-amber-100 text-amber-700",
  "OpenAI API": "bg-emerald-100 text-emerald-700",
};

const TOOL_INITIALS: Record<ToolName, string> = {
  Cursor: "Cu",
  "GitHub Copilot": "GH",
  Claude: "Cl",
  ChatGPT: "GP",
  Gemini: "Ge",
  Windsurf: "WS",
  "Anthropic API": "An",
  "OpenAI API": "OA",
};

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

const IS_API_TOOL = (name: ToolName) =>
  name === "Anthropic API" || name === "OpenAI API";

export default function HomePage() {
  const router = useRouter();
  const {
    state,
    hydrated,
    setStep,
    setTeamSize,
    setUseCase,
    toggleTool,
    setToolPlan,
    setToolSeats,
    setToolSpend,
    getEnabledTools,
    TOOL_NAMES,
  } = useAuditForm();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabledCount = TOOL_NAMES.filter((n) => state.tools[n].enabled).length;

  async function handleSubmit() {
    const tools = getEnabledTools();
    if (tools.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools,
          teamSize: state.teamSize,
          useCase: state.useCase,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/audit/${data.shareToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run audit");
    } finally {
      setSubmitting(false);
    }
  }

  // Don't render until localStorage is hydrated to avoid flicker
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">SL</span>
            </div>
            <span className="font-semibold text-gray-900">SpendLens</span>
          </div>
          <span className="text-sm text-gray-500">AI Spend Auditor</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            How much are you overpaying for AI tools?
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Takes 2 minutes. No account needed.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => state.step > s && setStep(s as 1 | 2 | 3)}
                disabled={state.step <= s}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600
                  ${state.step === s ? "bg-green-600 text-white" : ""}
                  ${state.step > s ? "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200" : ""}
                  ${state.step < s ? "bg-gray-100 text-gray-400 cursor-default" : ""}
                `}
                aria-label={`Step ${s}`}
              >
                {s}
              </button>
              {s < 3 && (
                <div
                  className={`w-16 h-0.5 ${state.step > s ? "bg-green-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Team context */}
        {state.step === 1 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Tell us about your team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="team-size">Team size</Label>
                <Input
                  id="team-size"
                  type="number"
                  min={1}
                  value={state.teamSize}
                  onChange={(e) =>
                    setTeamSize(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-32"
                />
                <p className="text-sm text-gray-500">
                  Number of people using AI tools
                </p>
              </div>

              <div className="space-y-2">
                <Label>Primary use case</Label>
                <div className="flex flex-wrap gap-2">
                  {USE_CASES.map(({ value, label }) => (
                    <button
                      key={value}
                      id={`usecase-${value}`}
                      onClick={() => setUseCase(value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600
                        ${state.useCase === value
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                        }`}
                      aria-pressed={state.useCase === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="step1-next"
                  onClick={() => setStep(2)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                >
                  Next — Add your tools →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Tool configuration */}
        {state.step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">
                Toggle the tools your team uses and set the plan + seats.
              </p>
              {enabledCount > 0 && (
                <Badge variant="secondary">{enabledCount} selected</Badge>
              )}
            </div>

            {TOOL_NAMES.map((name) => {
              const tool = state.tools[name];
              const plans = PRICING_DATA[name];
              const isApi = IS_API_TOOL(name);
              const selectedPlan = plans.find((p) => p.name === tool.plan);

              return (
                <Card
                  key={name}
                  className={`shadow-sm transition-all ${tool.enabled ? "border-green-200 bg-green-50/30" : ""}`}
                >
                  <CardContent className="pt-4 pb-4">
                    {/* Tool header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${TOOL_COLORS[name]}`}
                          aria-hidden="true"
                        >
                          {TOOL_INITIALS[name]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {name}
                          </p>
                          {!tool.enabled && (
                            <p className="text-xs text-gray-400">
                              {isApi ? "Pay-as-you-go API" : `${plans.length} plans available`}
                            </p>
                          )}
                        </div>
                      </div>
                      <Switch
                        id={`toggle-${name.replace(/\s+/g, "-").toLowerCase()}`}
                        checked={tool.enabled}
                        onCheckedChange={(v) => toggleTool(name, v)}
                        aria-label={`Include ${name}`}
                      />
                    </div>

                    {/* Expanded config */}
                    {tool.enabled && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Plan selector — hide for API tools */}
                          {!isApi ? (
                            <div className="space-y-1">
                              <Label
                                htmlFor={`plan-${name.replace(/\s+/g, "-").toLowerCase()}`}
                                className="text-xs text-gray-500"
                              >
                                Plan
                              </Label>
                              <Select
                                value={tool.plan}
                                onValueChange={(v) => setToolPlan(name, v)}
                              >
                                <SelectTrigger
                                  id={`plan-${name.replace(/\s+/g, "-").toLowerCase()}`}
                                  className="h-9 text-sm"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {plans.map((p) => (
                                    <SelectItem key={p.name} value={p.name}>
                                      {p.name} — ${p.pricePerUserMonth}/user
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}

                          {/* Seats */}
                          {!isApi && (
                            <div className="space-y-1">
                              <Label
                                htmlFor={`seats-${name.replace(/\s+/g, "-").toLowerCase()}`}
                                className="text-xs text-gray-500"
                              >
                                Seats
                              </Label>
                              <Input
                                id={`seats-${name.replace(/\s+/g, "-").toLowerCase()}`}
                                type="number"
                                min={1}
                                value={tool.seats}
                                onChange={(e) =>
                                  setToolSeats(
                                    name,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                }
                                className="h-9 text-sm"
                              />
                            </div>
                          )}

                          {/* Monthly spend */}
                          <div className="space-y-1">
                            <Label
                              htmlFor={`spend-${name.replace(/\s+/g, "-").toLowerCase()}`}
                              className="text-xs text-gray-500"
                            >
                              {isApi
                                ? "Monthly API spend ($)"
                                : "Monthly total ($)"}
                            </Label>
                            <Input
                              id={`spend-${name.replace(/\s+/g, "-").toLowerCase()}`}
                              type="number"
                              min={0}
                              value={tool.monthlySpend}
                              onChange={(e) =>
                                setToolSpend(
                                  name,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="h-9 text-sm"
                            />
                            {!isApi && selectedPlan && !tool.manualSpend && (
                              <p className="text-xs text-gray-400">
                                {tool.seats} × ${selectedPlan.pricePerUserMonth} auto-calculated
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <Separator className="my-2" />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                ← Back
              </button>
              <button
                id="step2-next"
                onClick={() => setStep(3)}
                disabled={enabledCount === 0}
                className="flex-[2] bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                {enabledCount === 0
                  ? "Select at least one tool"
                  : `Review ${enabledCount} tool${enabledCount > 1 ? "s" : ""} →`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {state.step === 3 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Review your audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Context summary */}
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Team size</p>
                  <p className="font-semibold">{state.teamSize}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Use case</p>
                  <p className="font-semibold capitalize">{state.useCase}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tools</p>
                  <p className="font-semibold">{enabledCount}</p>
                </div>
              </div>

              {/* Tool list */}
              <div className="space-y-2">
                {TOOL_NAMES.filter((n) => state.tools[n].enabled).map((name) => {
                  const tool = state.tools[name];
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${TOOL_COLORS[name]}`}
                          aria-hidden="true"
                        >
                          {TOOL_INITIALS[name]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-gray-400">
                            {IS_API_TOOL(name)
                              ? "API usage"
                              : `${tool.plan} · ${tool.seats} seat${tool.seats > 1 ? "s" : ""}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${tool.monthlySpend.toFixed(0)}/mo
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-500">Total monthly spend</span>
                <span className="text-lg font-bold text-gray-900">
                  $
                  {TOOL_NAMES.filter((n) => state.tools[n].enabled)
                    .reduce((sum, n) => sum + state.tools[n].monthlySpend, 0)
                    .toFixed(0)}
                  /mo
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                >
                  ← Edit tools
                </button>
                <button
                  id="run-audit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-[2] bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                >
                  {submitting ? "Running audit…" : "Run my audit →"}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                No account needed. Your data is never sold.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
