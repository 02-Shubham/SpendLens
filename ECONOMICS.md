# Economics — SpendLens

## Business Model Context

SpendLens is a free tool that generates leads for Credex's AI credit consulting business. The economic value flows through a conversion funnel: free audit → email capture → consultation booking → Credex engagement. The tool has zero direct revenue. Its job is to make every step of that funnel as frictionless as possible.

---

## Converted Lead Value

**Credex deal structure** (estimated from the assignment brief and standard AI credits consulting patterns):
- A typical engagement involves a company buying AI credits through Credex, which earns a margin on the transaction
- Typical credit purchase: **$500–$2,000** per company (one-time or quarterly)
- Estimated Credex margin: **15–25%** of the credit value
- **Value per converted customer**: $75–$500 margin per engagement

**Conservative number used for math**: $250 per Credex engagement (midpoint of margin range at $1,000 credit purchase × 25%).

---

## CAC at Each GTM Channel

| Channel | Cash Cost | Time Cost | # Leads Expected | CAC |
|---------|-----------|-----------|-----------------|-----|
| Slack community posts (5 communities, launch day) | $0 | 3 hours | 30–50 audits | $0 cash / ~$45 time (at $15/hr) |
| X/Twitter thread | $0 | 2 hours | 20–40 audits | $0 cash / ~$30 time |
| Email to existing Credex list | $0 (already paying for email) | 1 hour to write | 80–120 audits | $0 incremental |
| Reddit DM outreach (50 users) | $0 | 4 hours | 10–15 audits | $0 cash / ~$60 time |
| Product Hunt launch | $0 | 6 hours | 100–300 audits | $0 cash / ~$90 time |

**Key insight**: The CAC for this channel is time, not money. At the scale we're targeting (hundreds, not thousands, of audits), there's no need to buy ads. The distribution channels are entirely organic.

---

## Conversion Funnel with Numbers

```
1,000 visitors
  → 400 audit starts         (40% start rate — high intent from Slack/email)
    → 320 audit completions  (80% completion rate — 3-step form is short)
      → 80 emails captured   (25% capture rate from results page)
        → 16 consultation bookings (20% of email captures book a call)
          → 4 purchases      (25% of consultations close)
            × $1,000 avg deal = $4,000 revenue per 1,000 visitors
```

**Revenue per audit**: $4,000 / 320 = **$12.50 per completed audit**  
**Revenue per email captured**: $4,000 / 80 = **$50 per email**  
**Revenue per consultation**: $4,000 / 16 = **$250 per consultation**

These numbers make the value exchange clear: an email captured on the results page is worth $50 to Credex in expectation. Every UX decision on the email capture modal should be evaluated against that number.

---

## Path to $1M ARR

$1M ARR ÷ $250/engagement = **4,000 Credex engagements per year**

**Option A: Volume play**
- 4,000 engagements/year = 333/month
- At 20% consultation-to-close rate: 1,665 consultations/month
- At 20% email-to-consultation rate: 8,325 emails/month
- At 25% email capture rate: 33,300 audits/month
- At 40% audit start rate: 83,250 monthly visitors needed

83,000 monthly visitors is a real content/SEO play — achievable in 12–18 months with consistent blog content targeting the "cursor vs copilot" type queries.

**Option B: Deal size play**
- If average deal size is $5,000 (larger companies, larger credit purchases):
- 200 engagements/year = 17/month
- At same funnel rates: ~4,200 audits/month
- At 40% start rate: ~10,500 monthly visitors

10,500 monthly visitors is reachable with a Product Hunt launch + Credex's existing email list + 6 months of organic growth.

**Most realistic path to $1M ARR**:
Deal size × volume. Focus on converting high-quality leads (engineering managers at 20+ person startups where the savings number from the audit is $500+/month) into consultations. These leads are worth 3–5× more per engagement because the credit purchase scales with team size. Target deal size: $1,500 average. Volume needed: 667 engagements/year = 55/month. Funnel to that: ~7,000 audits/month.

**Timeline**: Credible at 18–24 months post-launch with sustained distribution effort.

---

## Unit Economics Check

**Does the funnel math close at scale?**

At 7,000 audits/month:
- Supabase cost: ~$25/month (Pro tier, well within 500M row limit)
- Gemini API cost: ~$0.02 per summary × 7,000 = $140/month
- Resend cost: ~$20/month (50k emails plan, covers 7,000 × 25% = 1,750 emails/month)
- Vercel cost: ~$20/month (Pro tier)

**Total infrastructure cost**: ~$205/month  
**Revenue at 55 engagements/month × $1,500**: $82,500/month  
**Gross margin**: >99%

The economics are essentially a pure software business at this scale. The marginal cost of an additional audit is near zero.
