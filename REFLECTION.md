# Reflection — SpendLens

## Q1: What problem does SpendLens actually solve?

The problem isn't that startups don't know what tools they pay for. Most CTOs can pull up a credit card statement and see the line items. The problem is they don't know **whether each tool is worth what they're paying relative to what their team actually does with it**. "We pay $200/month for GitHub Copilot" tells you nothing if you don't know that half your team also has Cursor Pro and uses Copilot for nothing but auto-complete that Cursor already does better.

SpendLens makes the invisible visible: it surfaces workflow-level overlap that no one notices because each tool's subscription is authorized by a different person at a different time. The "aha" moment isn't the total savings number — it's the specific call-out: "You're paying $95/month for a tool that Cursor already covers completely."

---

## Q2: What would you do differently if you started over?

The 3-step form was designed before I talked to real users. I assumed engineers would know their "usage intensity" (light/moderate/heavy) and their exact monthly spend. In practice, neither is true — they know roughly how much they pay (from memory, not a statement) and they have no frame of reference for "moderate" usage.

If I started over, I'd make the form feel less like a questionnaire and more like a calculator. Instead of asking "how intensely do you use this?" I'd ask "how many messages/requests does your team send per week?" — a concrete number they can actually answer. This changes the output from "light user" (vague) to "340 requests/week, which is within the free tier's 2,000/month limit" (specific and actionable).

---

## Q3: What's the most important thing you learned technically?

The audit engine architecture decision — pure TypeScript function, no I/O, runs in the browser — was the right call, but I didn't appreciate why until I tried to debug a race condition where the results page was showing stale data.

Because the audit runs synchronously in the client and only writes to Supabase for persistence (not for the result), the results page is always showing current data — not a DB read that might be milliseconds behind. The DB write is fire-and-forget for the shareable URL; the actual displayed results come from the same in-memory computation. This architecture made the results page effectively instant to load (no async wait for audit results), simplified testing (pure function with no mocks), and made the shareable URL work without any real-time sync complexity.

The lesson: colocating computation with the client where possible is underrated in "everything is an API" frameworks. Not every piece of logic needs a round-trip to a server.

---

## Q4: How did you use AI tools, and when was one wrong?

**Tool used**: Claude (Anthropic) via the claude.ai chat interface, throughout the project.

**Primary uses**:
- Drafting the initial `AuditSummary` TypeScript type — I described the shape I needed and it produced a clean interface I only had to adjust once
- Writing the Supabase SQL schema for the `audits` table
- Debugging the `@vercel/og` edge function — the error messages from that library are opaque and Claude correctly identified that the `ImageResponse` constructor signature changed between versions

**One time it was wrong**: When I asked Claude to help debug the Resend email not arriving, it suggested adding `text/plain` as an explicit content-type header to the `Resend.send()` call. This was confidently wrong — Resend's SDK doesn't need or accept that header, and adding it broke the API call with a 400 error. The actual problem was the unverified sender domain, which I found myself by reading Resend's own error response. Claude was pattern-matching on generic email API debugging advice, not Resend-specific behavior. Lesson: when an AI suggestion makes a previously-working API call throw a new error, the suggestion is wrong — check the official docs before applying it.

---

## Q5: If this were a real product, what's the next thing you'd build?

A scheduled re-audit. Right now, SpendLens is a one-time snapshot. The real value would be continuous monitoring: "Your Cursor spend went up $200 this month. Three new seats were added. Should they be on the Team plan?" 

This requires:
1. Storing the email from the lead capture form
2. A weekly cron job (Vercel Cron or Inngest) that re-runs the audit on the saved tool data
3. An email that says "Your AI stack changed — here's what's different and what you could save"

The product becomes a recurring touchpoint instead of a one-time tool, which is the difference between a marketing artifact and a product people depend on. It also dramatically improves Credex's lead quality: a company that re-audits 4× has a much higher probability of converting to a consultation than one that audited once and forgot about it.

The other thing I'd build: a "send to finance" flow. Engineers run the audit. The CTO or CFO makes the purchasing decision. There's currently no way to package the audit as a PDF or shareable report formatted for a finance team (not an engineer). A one-click "Export PDF" that produces a clean page with the tool list, current cost, recommended cost, and action items would remove the friction between "I ran the audit" and "we actually acted on it."
