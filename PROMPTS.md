# Prompts — SpendLens AI Summary

## Where the Prompt Is Used

File: `app/api/summary/route.ts`

The `/api/summary` endpoint receives the full `AuditSummary` object (the structured output from the audit engine) and uses it to generate a plain-English 80–100 word paragraph summarizing the most important finding. This paragraph appears at the bottom of the results page under "AI Summary."

---

## The Exact Prompt

```typescript
const prompt = `You are a financial advisor reviewing an AI tool spend audit. Write a 80-100 word personalized summary paragraph for a startup team. Be specific about their biggest saving opportunity. Tone: direct, professional, no fluff. Audit data: ${JSON.stringify(auditSummary)}. Return only the paragraph, no preamble.`
```

---

## Why It's Structured This Way

### Role framing: "financial advisor"
The first version used "You are a helpful assistant." The output was vague and padded — things like "Great news! You have some opportunities to save money!" A financial advisor persona produces more direct language: "Your biggest cost inefficiency is X. Here's exactly what to do." The persona sets the expected register without needing to enumerate every stylistic rule.

### Word count constraint: 80–100 words
Without a hard limit, the model expands indefinitely. The first few attempts generated 200+ word summaries that buried the key insight. 80–100 words forces the model to pick the single most impactful finding rather than cataloguing every recommendation. This matches the UI card's dimensions — longer text breaks the layout and kills the scannability.

### "Return only the paragraph, no preamble"
Without this instruction, models prefix responses with "Here is the summary:" or "Certainly! Based on the audit data...". These phrases break the "paste-to-Slack" mental model users have for this card. The no-preamble instruction cuts the boilerplate consistently.

### What we tried first that didn't work

**Attempt 1**: Asked Gemini to "list the top 3 recommendations." Output was always a bullet list, which didn't fit the prose card design. Switching to "write a paragraph" fixed this.

**Attempt 2**: Sent only the savings numbers, not the full `AuditSummary`. The model produced generic text ("consider reviewing your subscriptions") because it didn't know which specific tool was causing the savings. Sending the full JSON — tool names, plan names, workflow tags, and reasoning strings — lets the model produce "Your Cursor Pro + GitHub Copilot overlap for coding workflows is costing $95/month for coverage a single tool provides."

**Attempt 3**: Used `anthropic-ai/sdk` (Claude). Claude's outputs were higher quality but latency was 3–4× higher than Gemini Flash. For a summary card that appears after the audit is already visible, a 4-second delay felt broken. Gemini Flash produces acceptable quality at <1 second.

---

## The Fallback Template

```typescript
const fallbackSummary = `Based on your AI stack audit, we've identified $${auditSummary.totalMonthlySavings.toFixed(2)} in potential monthly savings ($${auditSummary.totalAnnualSavings.toFixed(2)} annually). Your biggest opportunity lies in ${auditSummary.results.sort((a, b) => b.monthlySavings - a.monthlySavings)[0]?.recommendedAction || "optimizing your current plans"}. Implementing these changes will streamline your operations while maintaining the same AI power for your ${auditSummary.results.length} tools.`
```

### Why the fallback uses real numbers, not generic text

The fallback fires when:
1. `GEMINI_API_KEY` is not set (local dev without the env var)
2. The API call throws (rate limit, network error, malformed response)
3. The API returns an empty string

A generic fallback like "We found some savings opportunities" is useless — it gives the user no information and makes the AI Summary card feel broken. The template extracts three real values from the already-computed audit:
- `totalMonthlySavings` — the exact dollar amount
- `totalAnnualSavings` — the annual projection (always `× 12`, no estimation)
- `recommendedAction` of the highest-savings tool — the specific action in plain language

This means the fallback text reads like: "Based on your AI stack audit, we've identified $95.00 in potential monthly savings ($1,140.00 annually). Your biggest opportunity lies in Drop GitHub Copilot — Cursor covers all the same workflows. Implementing these changes will streamline your operations while maintaining the same AI power for your 2 tools."

That's genuinely useful. It's the same information the results cards show, distilled into one sentence. A user who doesn't read anything else still gets the key fact.
