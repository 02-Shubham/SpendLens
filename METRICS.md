# Metrics — SpendLens

## North Star Metric

**Audits completed per week**

An audit is "completed" when a user reaches the results page with at least one tool configured. This is the North Star because it directly measures value delivered — not traffic, not signups, not impressions.

A completed audit means:
- The user had a real AI stack to audit (qualified intent)
- The tool ran to completion (the form flow worked)
- The user received actionable recommendations (the product delivered its core promise)

It's also the leading indicator for everything downstream: email captures, consultations, and Credex revenue all flow from completed audits. If audits go up, everything else follows. If audits go up but emails don't, the results page has a conversion problem — but audits themselves are still the engine.

**Why not "visitors"**: Visitors measure distribution, not value. A viral tweet could send 10,000 visitors who all bounce immediately — the product created no value.

**Why not "emails captured"**: Email capture is a downstream metric from audits. Optimizing email capture before audit volume is premature — you can make the email gate aggressive and capture more emails while delivering less value. Audits completed keeps the incentive pure.

---

## 3 Input Metrics

### 1. Landing Page → Audit Start Conversion Rate

**Definition**: % of homepage visitors who click "Run Free Audit" and reach the `/start` page  
**Target**: ≥ 40%  
**Where to measure**: Vercel Analytics, or any event on the CTA button click  

**Why it matters**: This tells you if the landing page copy and design is compelling. Below 30% means the value prop isn't landing or there's too much friction on the landing page itself.

**If it's low**: A/B test the headline. The current headline is "Find out if you're overpaying for AI tools" — test against "How much is your team wasting on AI subscriptions?" and "Free AI cost audit for startups."

---

### 2. Audit Completion Rate (Form Start → Results Page)

**Definition**: % of users who begin the form on `/start` and reach the results page  
**Target**: ≥ 75%  
**Where to measure**: Track events at each step: "form_started", "step_2_reached", "step_3_reached", "audit_submitted"  

**Why it matters**: This is where the funnel has the most leverage. A drop between Step 1 and Step 2 means the tool configuration step is confusing. A drop between Step 2 and Step 3 means the team context questions are unclear. Measuring step-by-step completion identifies exactly where to fix.

**Funnel breakpoints to instrument**:
- Step 1: Team basics (team size, org type, growth trajectory)
- Step 2: Tool configuration (adding tools, plans, seats, workflows)
- Step 3: Confirm and submit

A drop-off at Step 2 (adding tools) is the most common issue — users who try to add 4+ tools tend to abandon. Solution: show the donut chart preview update in real-time as tools are added to make progress feel rewarding.

---

### 3. Email Capture Rate

**Definition**: % of completed audits where the user enters their email  
**Target**: ≥ 20%  
**Where to measure**: Track "email_captured" events fired from the lead capture form  

**Why it matters**: This is the direct conversion to Credex's lead pipeline. Below 10% suggests the results page isn't creating enough urgency or perceived value to motivate giving an email. Above 30% suggests the results are genuinely compelling.

**Segmentation**: Measure email capture rate separately for audits showing savings > $100/month vs. < $100/month. Users who see larger savings are more motivated to capture the report. If the capture rate is low even for high-savings audits, the email ask is positioned wrong.

---

## What to Instrument First

### Priority 1: Audit completion funnel (Steps 1 → 2 → 3 → Results)

This is the first instrumentation to add. Four event calls — one at each form step — is 30 minutes of work and immediately shows you where users drop off. Without this, any optimization is guessing.

**Implementation**: Add `analytics.track("step_completed", { step: 1, tools_added: 0 })` at each step transition. Use Vercel Analytics or Mixpanel (free tier covers this volume).

### Priority 2: Results page scroll depth

Does the user scroll past the recommendation cards? Do they reach the AI Summary? The email capture form? Scroll depth tells you which sections of the results page users actually read vs. where they bounce.

**Implementation**: Add an IntersectionObserver on the AI Summary section and the lead capture form. Fire events when they come into view.

### Priority 3: Share button clicks

Every time the share link is copied, fire an event. Track how many audits result in a share action. This is a leading indicator of word-of-mouth growth — if 1 in 5 audits generates a shared link, SpendLens has organic distribution built in.

---

## Pivot Triggers

### If email capture rate < 10% after 100 audits

The results page is not compelling enough. Two possible causes:
1. **Savings numbers are too low**: The audit is finding small savings ($20–50/month) that don't feel worth an email. Fix: check if the audit rules are being triggered — are most users getting "optimal" on every tool? If yes, add more rules or lower the thresholds.
2. **The email ask is positioned wrong**: The email capture form appearing after the results are already visible removes urgency. Consider gating the email ask *before* showing the AI Summary section specifically. The recommendation cards are visible immediately; the email captures access to the full written report.

### If audit completion rate < 50% after 100 form starts

The form is too long or confusing. Fix: remove the "months active" field (users don't remember this accurately) and pre-fill "team size" from the first step into the tool card's seat count. Reducing one input per tool card has an outsized effect on completion rates.

### If landing → audit start rate < 25%

The landing page copy isn't landing. The value proposition is abstract. Fix: add a real example audit to the homepage — not a description of what SpendLens does, but an actual screenshot of a result showing "we found $380/month in savings for a 20-person team." Concrete beats abstract for conversion on tool landing pages.
