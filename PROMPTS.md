# Prompts — SpendLens AI Summary

## Where the Prompt Is Used

File: `app/api/summary/route.ts`

The `/api/summary` endpoint receives the full `AuditSummary` object (the structured output from the audit engine) and uses it to generate a punchy, 2-3 sentence plain-English summary. This appears at the bottom of the results page under "AI Summary."

---

## The Exact Prompt

```typescript
const prompt = `You are a blunt, friendly advisor helping a startup CTO cut their AI software costs. Write 2-3 short sentences (max 70 words total) that:
1. Start with the single biggest action they should take RIGHT NOW and how much it saves per year (use exact numbers from the data).
2. Give one sentence on the next best action.
3. End with a simple, encouraging close — no corporate speak.

Rules:
- Use plain English. Write like you're texting a smart friend, not writing a report.
- NO words like: "leverage", "optimize", "implement", "streamline", "transition", "significant", "efficiency".
- Use "$X/yr" not "$X annually". Use "switch to" not "migrate to".
- IMPORTANT: If a recommendation advises consolidating specific tasks/workflows from a tool while leaving remaining spend active, phrase it as "Drop [workflow] from [Tool]" rather than instructing them to switch or ditch the tool entirely.
- Be specific with tool names and dollar amounts.

Audit data: ${JSON.stringify(auditSummary)}

Return only the 3-4 sentences, nothing else.`;
```

---

## Why It's Structured This Way

### Role framing: "blunt, friendly advisor"
Initial versions used "financial advisor," which led to overly formal and complex jargon (e.g., "executing transitions"). The "blunt advisor" persona combined with "texting a smart friend" forces the model into a higher-velocity, lower-friction register. It feels more like a direct insight than a formal report.

### Banned Jargon
We explicitly ban corporate-speak like "leverage," "optimize," and "streamline." These words are fillers that add length without adding value. Forcing the model to use simple verbs like "switch" or "drop" makes the advice feel much more actionable to a busy CTO.

### Word count constraint: Max 70 words
We moved from 80-100 down to 70 words. This ensures the output is scannable in seconds. The goal isn't to be comprehensive—it's to highlight the #1 most important thing and get out of the way.

### "Return only the sentences, no preamble"
Cuts out LLM conversational filler like "Here is your summary..." or "Based on my analysis...".

---

## What we tried first that didn't work

**Attempt 1**: Asked for a "detailed breakdown." Output was too long and users stopped reading halfway through.

**Attempt 2**: Professional financial persona. The output was too "safe" and used too much passive voice (e.g., "It is recommended that considerations be made..."). Switching to active voice ("Switch to Cursor") was the fix.

**Attempt 3**: Claude 3.5 Sonnet. Higher quality, but too slow for a "live" feeling audit. Gemini 1.5 Flash provides near-instant results which keeps the app's snappy momentum.

---

## The Fallback Template

```typescript
const topSaving = [...auditSummary.results].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
const fallbackSummary = `You're spending $${(auditSummary.totalMonthlySavings * 12).toFixed(0)} more per year than you need to. The biggest fix: ${topSaving?.recommendedAction || "consolidate overlapping tools"}${topSaving ? ` — that alone saves $${(topSaving.monthlySavings * 12).toFixed(0)}/yr` : ""}. Make that one change first, then tackle the rest.`;
```

### Why the fallback uses real numbers, not generic text

The fallback fires when:
1. `GEMINI_API_KEY` is not set.
2. The API call fails or is throttled.

A generic fallback is a dead end. This template ensures that even if the AI fails, the user gets the #1 most important piece of data calculated by the deterministic engine. It follows the same "blunt" style as the AI prompt for consistency.
