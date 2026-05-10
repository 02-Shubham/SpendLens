# Dev Log — SpendLens

---

## Day 1 — 2026-05-07

**What I built**: Project scaffolding, core data types, audit engine v1, Supabase table, results page, OG image route, lead capture API.

**Commits**:
- `Initial commit from Create Next App`
- `switch to Inter font, clean up layout for SpendLens`
- `add useAuditForm hook with localStorage sync`
- `build multi-step audit form on home page`
- `add results page, AI summary card, lead form, share section`
- `add /api/leads - rate limit, supabase update, resend email`
- `add dynamic OG image for audit share links`
- `fix plan selector - use native select instead of base-ui Select`
- `Started building SpendLens with core engine with Supabase and AI-powered cost optimization logic`

**Honest notes**: Day 1 was a sprint to get a vertical slice — something that could do a real audit end-to-end. The audit engine was naive: rules were single-condition if/else blocks with no concept of workflow context or tool capability mapping. The results page existed but was basically a JSON dump styled with cards. The AI summary worked but used OpenAI initially, which I swapped later.

The Supabase integration broke the first build because the client initialization crashes at build time when env vars aren't set. Fixed by wrapping the client in a factory function with null guards.

---

## Day 2 — 2026-05-08

**What I built**: AI provider swap (OpenAI → Gemini), complete redesign of the audit form UX, Framer Motion animations, per-tool workflow tagging system.

**Commits**:
- `so changed the ai provider to gemini and now will fixing the logic part..`
- `added dynamic tool card and upgraded ux and also enhanced audit form workflow capabilities`

**Honest notes**: The OpenAI API was working but latency was 3–4 seconds for the summary card, which felt broken. Gemini Flash brings it under 1 second. The model ID I initially used (`gemini-pro`) returned a 404 — had to find the correct current identifier (`gemini-1.5-flash-latest`).

The workflow tagging system was the biggest change. Previously, users picked an org type and the engine guessed which tools they used for what. This produced vague, wrong recommendations. Per-tool workflow tags let users say "we use Cursor for coding but ChatGPT for writing" — which is the actual data needed to detect real redundancy.

---

## Day 3 — 2026-05-09

**What I built**: Fixed all build errors, stabilized Resend integration, redesigned landing page, fixed ESLint issues, updated test threshold.

**Commits**:
- `fixing eslint issue`
- `fixingg`
- `updated the OpenAI API monthly spend threshold in audit engine test case`
- `redesigned the audit flow with new landing page, updated typography..`
- `improve Supabase client typing and safety checks, and fixed lint and build issue`
- `fixxinn`

**Honest notes**: A messy day. The Resend integration was silently failing — the API call was being made but the email wasn't arriving. Root cause: `RESEND_FROM_EMAIL` was set to a domain I hadn't verified. Switched to `onboarding@resend.dev` for dev. The landing page was also basically a default Next.js template — rebuilt it with the actual value prop, social proof, and tool logos. Several commits were lint-fix iterations; should have run the linter before committing.

---

## Day 4 — 2026-05-10

**What I built**: Multi-select org type picker, audit engine refactor to remove seat expansion rules, complete audit results UI redesign with brand icons and spend visualization.

**Commits**:
- `updated the OrgTypePicker to multi-select, icons, and enhanced audit engine logic with new tool attributes.`
- `refactor: remove seat utilization rule, update pricing data, and redesign audit results UI component`

**Honest notes**: The original audit engine had an "expand" rule that recommended buying more seats when teams were under-licensed. After user feedback (see USER_INTERVIEWS.md), this was clearly wrong — the tool should only help people spend less. Removed it entirely.

The org type picker went from a single dropdown to a multi-select chip interface. A startup can be both "SaaS" and "agency." The old design forced a single choice that didn't reflect reality.

Replaced the audit results cards' generic letter avatars with actual brand icons from `react-icons/si`. Visually, this was a huge upgrade — users immediately recognize the tools they're paying for.

---

## Day 5 — 2026-05-11

**What I built**: All documentation files (README, ARCHITECTURE, PRICING_DATA, PROMPTS, TESTS, DEVLOG, REFLECTION), entrepreneurial files (GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS), `.env.example`, and final polish.

**Commits**:
- `improved the audit results page, spend breakdown visualization, and improved animation`
- (documentation commits)

**Honest notes**: Writing the ARCHITECTURE and ECONOMICS files forced me to think about what I'd actually built rather than just what it does on screen. The scale analysis surfaced a real bug — there's no connection pooling config in the Supabase client, which will cause issues at even moderate traffic. Added PgBouncer setup instructions to ARCHITECTURE and flagged for implementation if the tool gets traction.

The economics math is sobering in a good way: even with conservative conversion rates, the audit funnel has real value as a Credex lead generation channel. A single converted consulting engagement covers weeks of development cost.
