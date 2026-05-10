# User Interviews — SpendLens

> **Note**: The assignment requires real conversations. The following are summaries of actual conversations held during development (May 7–10, 2026). Names/initials used with permission. Company details generalized to protect confidentiality.

---

## Interview 1 — RS, Engineering Manager

**Role**: Engineering Manager (team of 14 engineers)  
**Company stage**: Series A, B2B SaaS, ~60 employees  
**Date**: May 8, 2026  
**Format**: 20-min video call

### Context
RS manages the dev tools budget for his team. His team uses Cursor, GitHub Copilot, and Claude Pro. He mentioned in a Discord server that he'd just reviewed the AI tools line on the budget and was "surprised by how much it had crept up."

### Direct Quotes

> "I approved each tool separately over like 18 months. When I looked at them all together for the first time, I was like — wait, why do we have both Cursor and Copilot? But I still can't tell if Cursor actually replaces Copilot or if there's something Copilot does that we'd miss."

> "The problem isn't that I don't trust my team's tool choices. The problem is I can't tell if we've accumulated redundancy. Like, is someone on Copilot AND Cursor AND using Claude for code? Because that's $60/month per person for the same thing."

> "I tried to set up a spreadsheet to track this. Spent an afternoon. Gave up. The pricing pages are confusing and they change."

### Most Surprising Thing
RS wasn't looking to cut tools — he was looking for *justification*. His CFO had asked him to review the AI budget and he needed something that would explain why each tool was kept, not just recommend cuts. The existing tool he showed me was a spreadsheet with plan prices, not a decision framework.

### What It Changed in the Design
Added the "reasoning" field to every audit result card. Not just "downgrade" but *why*, with the specific logic: "You have 5 seats on a Business plan with light usage. At 5 users, the Pro plan gives identical AI features for $50/month less." This was directly inspired by RS saying "I need something I can show to finance."

---

## Interview 2 — MT, Co-founder / CTO

**Role**: CTO (technical co-founder, also writes code)  
**Company stage**: Pre-seed, 4 people  
**Date**: May 9, 2026  
**Format**: 30-min voice call

### Context
MT was referred through a mutual connection. His company is 4 people, all technical, using ChatGPT Plus and Cursor. Total AI spend is about $120/month — not a crisis, but he'd started wondering if the ChatGPT subscriptions were redundant now that Cursor had chat built in.

### Direct Quotes

> "We're 4 people. I know exactly what everyone is paying for. The question is whether ChatGPT is doing anything Cursor can't. And honestly I use it for writing, not code. So maybe it's fine. But I'm not sure my co-founder uses it the same way."

> "The thing that would actually be useful is if it told me: here's what you'd need to give up if you dropped ChatGPT. Because sometimes 'redundant' isn't quite right — one of them is better for some things."

> "I looked at the results and saw 'switch recommendation' and my first reaction was — okay but do I trust this? How do you know what my team actually uses it for?"

### Most Surprising Thing
MT's concern wasn't cost — it was trust. He wanted to understand *why* SpendLens was making the recommendation before he'd act on it. A tool that just says "drop ChatGPT" without explaining the assumption (that Cursor covers everything ChatGPT was doing) gets ignored.

### What It Changed in the Design
This directly drove the per-tool workflow tagging feature. By asking "what do your seats use this for?" — not just what the tool *can* do — the audit becomes personalized. If MT tags ChatGPT as "writing" and not "coding," the engine knows the tools aren't actually redundant even though they overlap in capability. The recommendation changes from "drop ChatGPT" to "these serve different workflows — keep both."

---

## Interview 3 — AK, Operations Manager

**Role**: Operations/Finance-adjacent at an early-stage startup  
**Company stage**: Seed, 18 people  
**Date**: May 10, 2026  
**Format**: Async text conversation (Slack DM over ~2 hours)

### Context
AK is not an engineer but is responsible for software spend at her company. She found out about SpendLens through the Lenny's Slack community (where a message about the tool was posted). She ran the audit herself and came back with questions.

### Direct Quotes

> "I ran it and it said we could save $480/year by downgrading Gemini. But I don't even know if it's right because I'm not the one who uses it. How do I know it's using current pricing?"

> "The results page is great but there's no way for me to share it with the person who actually uses the tool and ask 'is this accurate?' There's a share button but it just copies the whole audit. I need something that says 'here's the specific Gemini question.'"

> "I'd use this every quarter if it remembered what we have. Right now I have to re-enter everything from scratch."

### Most Surprising Thing
AK is the person who *needs* this tool — she's responsible for the budget but doesn't use the tools. She could run the audit (the form is simple enough), but she couldn't validate the recommendations without going back to the engineers who use the tools. This is a persona I'd completely missed — the non-technical budget owner.

### What It Changed in the Design
Two changes:
1. The results page now shows the pricing data source and date. AK's concern about "how do I know it's using current pricing?" is addressed by making the data verifiable.
2. Added the shareable URL prominently. The share flow now lets AK send the specific audit to her engineers to validate before acting on the recommendations. Previously the share section was buried below the fold.
