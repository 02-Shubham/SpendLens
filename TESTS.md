# Tests — SpendLens

## How to Run

```bash
pnpm test
# or
npm test
# or
npx vitest run
```

All tests run in under 1 second (no I/O — pure TypeScript logic).

---

## Test Suite: `tests/audit-engine.test.ts`

File: `tests/audit-engine.test.ts`  
Runner: Vitest  
Subject: `lib/audit-engine.ts` — the core audit logic

---

### Test Cases

| # | Test Name | What It Tests | Expected Outcome |
|---|-----------|---------------|-----------------|
| 1 | Rule 1: Single light user on Pro plan should recommend Free tier | Detects when a single low-intensity user is on a paid plan when a free tier exists | `recommendation = "downgrade"`, `projectedMonthlyCost = 0`, reasoning mentions "free tier limits" |
| 2 | Rule 3: 3 heavy users on Team plan + scaling growth should stay optimal | Prevents false downgrades when growth trajectory justifies a higher tier | `recommendation = "optimal"`, action contains "positioned for growth" |
| 3 | Rule 5: Cursor + Copilot both for coding should drop Copilot with conditions | Detects strict tool redundancy and generates safe migration conditions | Copilot gets `recommendation = "redundant"`, `projectedMonthlyCost = 0`, `conditions.length > 0`, reasoning contains "covers all the same workflows" |
| 4 | Rule 6: Workflow overlap (Claude vs Cursor) should reallocate writing | Detects partial overlap where one tool covers a workflow more cheaply | Cursor gets `recommendation = "switch"`, action contains "Move writing workflows to Claude" |
| 5 | Rule 7: API spend $150/mo, team of 3 should recommend Team plan | Compares API PAYG spend against flat team plan break-even | `recommendation = "switch"`, `projectedMonthlyCost = 90` (3 × $30/seat ChatGPT Team), action contains "Switch to ChatGPT Team plan" |
| 6 | Rule 7: API spend $80/mo burst (2 months active) should stay on API, low confidence | Withholds recommendation when spend pattern is too new to classify | `recommendation = "optimal"`, `confidenceLevel = "low"`, reasoning contains "waiting another 2 months" |
| 7 | Rule 9: 20 seats for 10-person stable team should recommend reducing seats | Detects seat over-provisioning relative to actual team size | `recommendation = "downgrade"`, `projectedMonthlyCost = 220` (11 seats × $20), action contains "Reduce seats to 11" |
| 8 | Rule 2: Cursor for writing only should switch to Claude | Detects tool-workflow mismatch (coding IDE used only for writing) | `recommendation = "switch"`, action contains "Switch to Claude for writing workflows" |
| 9 | Rule 12: All tools already optimal should return all optimal with good reasoning | Validates the happy path — no false positives when setup is correct | `recommendation = "optimal"`, reasoning contains "appropriate because", `reasoning.length > 100` |

---

## Test Philosophy

Every test maps to a specific named rule in the audit engine (`lib/audit-engine.ts`). Tests are written to make wrong audit engine behavior immediately visible — not just "did it run" but "did it output the exact right recommendation with the right projected cost and the right reasoning text."

The `projectedMonthlyCost` assertions use exact numbers (`220`, `90`, `0`) so any change to the pricing data or rule logic that breaks a calculation fails immediately rather than silently.

The `reasoning` string assertions check for specific phrases because the reasoning string is shown to the user verbatim — it needs to be coherent, not just truthy.

---

## CI Integration

Tests run automatically on every push to `main` and every pull request via GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Test
  run: npx vitest run
```

The CI also runs `npm run lint` and `npm run build`, so a PR only passes if tests pass, linting passes, and the Next.js build succeeds with production environment variables injected.
