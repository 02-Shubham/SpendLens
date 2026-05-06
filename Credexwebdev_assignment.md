<!-- 
Web Development Intern Assignment — Round 1  Credex · credex.rocks  
Welcome  
Thanks for applying to Credex. Because of the volume of applications, our hiring  process is structured as:  
1. Round 1 (this document) — 7-day take-home build. AI-assisted review at first  pass, human review for shortlisted submissions.  
2. Round 2 — A shorter, focused build (~2 days). Released within 3 working days  of the Round 1 deadline, only to candidates who clear Round 1.  
3. Interviews — 1–2 conversations with the team, including a code walkthrough.  
Because we use AI to review submissions at the first stage, the format of your  deliverable matters as much as the work itself . Follow the file naming and structure  exactly. Submissions that don’t follow the format are filtered out before any human sees  them.  
This is not a coding assignment. It’s an entrepreneurial assignment that requires  shipping working code. We’re hiring people who can ship a product, not people who can  solve a Leetcode problem.  
Timeline  
 Released: Date on which shared  
 Deadline: + 7 days 
 Late submissions are not reviewed. No exceptions. 
 CONFIDENTIAL  
What we’re evaluating  
What How we measure it  
Discipline Did you start early? Are commits and  devlog entries spread across the week?  
Hard work Depth, polish, and how much you actually  shipped relative to scope  
Consistency Daily progress over multiple distinct  calendar days, not weekend cramming  
Programming skills Idiomatic, readable, debuggable code  
Thinking models Quality of trade-offs, decisions,  architecture writeups, and reflection  
Engineering skills Git hygiene, tests, CI, docs, accessibility,  deployed and working  
Entrepreneurial thinking 
Do you understand the user, the  
economics, and how to ship something  people will actually use? 



The Project — AI Spend Audit  
The opportunity (read this carefully) 
Credex sells discounted AI infrastructure credits — Cursor, Claude, ChatGPT  Enterprise, and others — sourced from companies that overforecast or pivoted. The  discount is real and substantial.  
But here’s the problem: most startups don’t know they’re overspending on AI tools  in the first place. They look at their monthly bill, sigh, and pay it. They have no  benchmark, no obvious alternatives surfaced, no second opinion. There’s no “Mint for AI  tool spend.”  
Your project is to build that tool. It’s a free product that genuinely helps any startup  founder or engineering manager who uses it — and it’s a lead-generation asset for  Credex, because the audits will surface real overspend, and for users with significant  savings opportunities, Credex is the solution.  
You are not building a coding exercise. You are building something Credex could  plausibly launch on Product Hunt next month. Treat it that way. 
 CONFIDENTIAL  
What you’re building 
A free web app — call it whatever you want, naming is part of the test — that does this  end-toend:  
1. A cold visitor lands on the page from a tweet, a blog post, or Hacker News  
2. They input what AI tools they pay for, what plan, monthly spend, team size, and  primary use case  
3. They get an instant on-screen audit: where they’re overspending, what to switch  to or downgrade, and total potential monthly + annual savings  
4. They get an option to capture the report (email gate) and — for high-savings  cases — book a Credex consultation  
5. The result is shareable via a unique public URL with proper Open Graph  previews  
No login required to use the tool. Email is captured after value is shown, never before.  MVP features (all six required) 
1. Spend input form 
Support at minimum these tools as of submission week:  
Cursor (Hobby / Pro / Business / Enterprise)  
 GitHub Copilot (Individual / Business / Enterprise)  
 Claude (Free / Pro / Max / Team / Enterprise / API direct)  
 ChatGPT (Plus / Team / Enterprise / API direct)  
 Anthropic API direct  
 OpenAI API direct  
 Gemini (Pro / Ultra / API)  
 Windsurf or v0 — your pick of one more  
For each tool: which plan, current monthly spend, number of seats. Plus team size and  primary use case (coding / writing / data / research / mixed). Form state must persist  across page reloads. 
 CONFIDENTIAL  
2. Audit engine 
For each tool the user is on, the engine evaluates:  
 Are they on the right plan for their usage? (e.g., Team for 2 users is overkill)   Is there a cheaper plan from the same vendor that fits?  
 Is there a substantially cheaper alternative tool with similar capability for their use  case?  
 Are they paying retail when they could get the same thing through credits?  
The logic must be defensible . A finance person should read your reasoning and agree.  Not “Cursor bad, Claude Code good” — actual usage-fit reasoning with numbers.  
Pricing data must be current as of your submission week . Sources cited in  PRICING_DATA.md — every number must trace back to an official pricing page URL.  
3. Audit results page 
 Per-tool breakdown: current spend → recommended action → savings + 1- sentence reason  
 Hero: total monthly savings + total annual savings, big and clear  
 For audits showing >$500/mo savings: surface Credex prominently as the way to  capture more of that savings  
 For audits showing <$100/mo or already-optimal: be honest. “You’re spending  well.” Don’t manufacture savings. Still capture the lead with a “notify me when  new optimizations apply to your stack” signup  
Visual quality matters. This is the page that gets screenshotted and shared.  4. AI-generated personalized summary 
Use the Anthropic API (preferred — apply for free credits if you don’t have access) or  any LLM to generate a ~100-word personalized summary paragraph based on the audit.  Must handle API failures gracefully (fallback to a templated summary). Your full prompt  goes in PROMPTS.md .  
This is the one feature where you must use AI. For the audit math itself, hardcoded  rules are correct — knowing when not to use AI is part of the test. 
 CONFIDENTIAL  
5. Lead capture + storage 
 Email capture with optional fields: company name, role, team size  
 Stored in a real backend: Supabase, Firebase, Cloudflare D1, your own Postgres  on Render — your call  
 Sends a transactional email (Resend / Postmark / SES free tier) confirming the  audit and noting Credex will reach out for high-savings cases  
 Basic abuse protection: rate limit, honeypot, or hCaptcha. Document your choice  and why.  
6. Shareable result URL 
Each audit gets a unique public URL  
 Identifying details (company name, email) stripped from the public version. Tools  and savings numbers shown.  
 Open Graph tags for clean link previews (Twitter card too)  
 This is the viral loop — design accordingly  
Bonus (only attempt after MVP works end-to-end) PDF export of the full report  
 Embeddable widget version ( <script> tag a blogger could drop in)  
 Benchmark mode: “your AI spend per developer is $X — companies your size  average $Y”  
 Referral codes — share the tool, both parties get a perk  
 A short blog post or Twitter thread draft pitching the tool, written as if you were  launching it. 
 CONFIDENTIAL  
Constraints 
Frontend framework: React, Next.js, Vue, Svelte, SolidJS, or vanilla. Justify it in  ARCHITECTURE.md .  
 TypeScript strongly preferred. If you use plain JavaScript, justify it.  
 No website builders. No Wix, Webflow, Framer, Bubble. No “admin dashboard  templates” where the UI is pre-built. Tailwind, shadcn/ui, MUI, Mantine, headless  primitives are all fine.  
 Lighthouse mobile scores on the deployed URL: Performance ≥ 85,  Accessibility ≥ 90, Best Practices ≥ 90.  
No secrets in the repo. Use environment variables.  
Deliverables  
Submit a single Google Form response with the four items  below. Anything missing = automatic rejection.  
1. Public GitHub repo URL 
Public. Contains everything in section 3.  
2. Live deployed URL 
Vercel, Netlify, Cloudflare Pages, Render, Fly.io, or equivalent. Localhost screenshots  do not count. The URL must be reachable when we open it.  
3. Required files at the repo root 
LLMs read these files during evaluation. Filenames and format are not optional. All in  plain markdown.  
Engineering files 
README.md 
 2–3 sentence summary of what you built and who it’s for  
 3+ screenshots or a 30-second screen recording (YouTube/Loom link)   Quick start: install, run locally, deploy  
 A “Decisions” section listing 5 trade-offs you made and why  
 Link to the deployed URL 
 CONFIDENTIAL  
ARCHITECTURE.md 
 A system diagram in Mermaid (renders inline on GitHub) or ASCII   Data flow: how a user’s input becomes an audit result  
 Why you chose your stack  
 What you’d change if this had to handle 10k audits/day  
DEVLOG.md — the most important file we read  
One entry per day, for 7 days. Backdating is obvious in git history; we check. Use this  exact format:  
## Day 1 — YYYY-MM-DD 
**Hours worked:** X 
**What I did:** ... 
**What I learned:** ... 
**Blockers / what I'm stuck on:** ... 
**Plan for tomorrow:** ... 
If you took a day off, write that entry too — Hours worked: 0 , with a one-line reason.  Honesty scores higher than fake entries. We can tell.  
REFLECTION.md 
Answer all 5 questions, 150–400 words each :  
1. The hardest bug you hit this week, and how you debugged it (be specific — what  hypotheses did you form, what did you try, what worked?)  
2. A decision you reversed mid-week, and what made you reverse it  3. What you would build in week 2 if you had it  
4. How you used AI tools (which tool, for what tasks, what you didn’t trust them with,  and one specific time the AI was wrong and you caught it)  
5. Self-rating on a 1–10 scale for each: discipline, code quality, design sense,  problemsolving, entrepreneurial thinking — with a one-sentence reason for each  
TESTS.md 
List every automated test you wrote: filename, what it covers, how to run it  
 Minimum: 5 tests covering the audit engine specifically. They must actually run.  We will run them.  
.github/workflows/ci.yml 
A GitHub Actions workflow that runs lint + tests on every push to main . Must show  green checks on your latest commit. 
 CONFIDENTIAL  
PRICING_DATA.md 
Your sources for every tool’s pricing. Every number in your audit engine must trace to a  URL on the vendor’s official pricing page, with the date you pulled it. Format:  
## Cursor 
- Pro: $20/user/month — https://cursor.sh/pricing — verified YYYY-MM-DD - Business: $40/user/month — ... 
PROMPTS.md 
The full LLM prompts you used in the tool. Why you wrote them this way. What you tried  that didn’t work.  
Entrepreneurial files 
These are evaluated as carefully as the code. Half of strong applicants under-invest  here. Don’t be them. 
GTM.md (300–700 words)  
 Who is the exact target user — not “startups,” but a specific job title at a specific  company stage  
 What they Google or scroll through right before they’d want this tool  
 Where they hang out online (specific subreddits, Slack groups, Discord servers,  X lists)  
 How you’d get the first 100 users in 30 days with $0 paid budget — be specific,  not “post on Twitter”  
 The unfair distribution channel — what’s the one thing only you (or Credex) could  do  
 What week-1 traction looks like if this works (specific numbers)  
What scores well: specific, weird, real channels. What scores poorly: “we’ll do SEO and  content marketing.” 
 CONFIDENTIAL  
ECONOMICS.md (300–700 words)  
If Credex deployed this tool tomorrow, run the unit economics:  
 What’s a converted lead worth to Credex (estimate; show your reasoning)   What’s CAC at each channel from your GTM plan  
 What conversion rate from “audit completed” → “Credex consultation booked” →  “credit purchase” makes this profitable  
 What would have to be true for this tool to drive $1M ARR in 18 months  
 Show the math even if your inputs are rough estimates. Approximate numbers >  no numbers.  
What scores well: a realistic spreadsheet-style breakdown. What scores poorly: vague  TAM hand-waving.  
USER_INTERVIEWS.md (3 interviews, ~150–300 words each)  
Notes from three real conversations you had with potential users. 10–15 minutes each.  Cold DM founders on X, ask in indie hacker Slacks, use your college network, talk to  friends running side projects. For each:  
 Name (or initials if they preferred anonymity), role, company stage   3+ direct quotes  
 The most surprising thing they said  
 What it changed about your design  
These conversations must have happened. Fabricated interviews are obvious —  they’re generic, lack specific contradictions, and have no surprising moments. We’ve  read enough of them to spot the pattern. Faking this is an instant reject. Talking to three  humans this week is non-negotiable. 
 CONFIDENTIAL  
LANDING_COPY.md 
Treat this as the actual landing page copy a marketer would ship:   Hero headline (≤10 words)  
 Subheadline (≤25 words)  
 Primary CTA copy  
 Social proof block (mocked is fine, indicate it’s mocked)  
 FAQ — 5 real Q&As  
METRICS.md (200–500 words)  
 Your single North Star metric — and why  
 3 input metrics that drive the North Star  
 What you’d instrument first  
 What number triggers a pivot decision  
What scores well: metrics that match a B2B lead-gen tool at this stage. What scores  poorly: “DAU” as a metric for a tool people use once a quarter.  
4. Git history requirements 
We read git log . These rules are checked programmatically:  
 Commits on at least 5 distinct calendar days within the 7-day window. Verify  yourself with:  
 git log --pretty=format:"%ad" --date=short | sort -u | wc -l If fewer than 5, submission is rejected.  
 Conventional Commits format preferred ( feat: , fix: , docs: , refactor: ,  chore: , test: )  
 Meaningful commit messages. “update”, “fix”, “wip”, “asdf” are red flags. “fix:  handle 429 from Anthropic API gracefully in summary fallback” is what we want. 
 CONFIDENTIAL  
Evaluation rubric (100 points total)  
Dimension Weight What scores well  Entrepreneurial thinking 25 GTM, economics, user  interviews, landing copy,  
metrics — all show real  
founder mindset, not  
template-fill  
Engineering skills 15 Git hygiene, CI green, ≥5  working tests, deploy  
works, accessibility  
considered  
Thinking models 15 ARCHITECTURE depth,  REFLECTION specificity,  
README “Decisions”  
section non-trivial  
Programming skills 15 Code is readable, sensible  abstractions, types used  
well, no obvious bugs in  
happy path  
Hard work 10 All 6 MVP features work,  polish in UI, bonus  
attempted  
Discipline & consistency 10 DEVLOG has 7 dated  entries with depth, commits  
across ≥5 days  

Polish of the audit logic  itself  
10 A finance-literate person  reads your reasoning and  
agrees with it 

 CONFIDENTIAL  
Ground rules  
 AI tools (Cursor, Claude, ChatGPT, Copilot, Codex, etc.) are allowed and  expected. Credex is an AI infrastructure company. Disclose your usage in  REFLECTION.md honestly. We can tell when an entire codebase is one-shot  
generated, and that autorejects — not because AI is bad, but because a one shot codebase tells us nothing about you.  
 The user interviews requirement is real. Three actual humans. The quality of  these conversations is one of the strongest signals we read. They are also the  easiest part to explain to customers when we hire you.  
 Pricing data accuracy matters. Every number must cite a vendor URL. We  spot-check.  
 No private dependencies, no closed-source libraries, no hardcoded secrets. 
 No communication during the week beyond the email below. Part of what we  evaluate is how you handle ambiguity. Make a reasonable assumption,  document it in DEVLOG.md, move on.  
 By submitting, you grant Credex a non-exclusive license to learn from  public elements of your submission. You retain full ownership of your code.  Use it for your portfolio.  
What happens next  
 Within 3 working days of the deadline, you’ll hear back: shortlisted (Round 2), or  not.  
 Round 2 is a smaller, focused build (~2 days, more constrained scope).  Released to shortlisted candidates only.  
 Interviews follow Round 2 — 1–2 conversations with the team, including a  walkthrough of your Round 1 + Round 2 code, and a discussion of one decision  in your ECONOMICS.md or GTM.md .  
We’re a small team building a real product in a noisy market. We hire people who ship,  write down their thinking, and treat their own work seriously. Show us you’re one of  them.  
Good luck.  
— Credex 
 CONFIDENTIAL   -->
