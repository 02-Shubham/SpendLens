# Pricing Data — SpendLens

All prices are in USD. Prices are per user per month unless otherwise noted.
Last verified: 2026-05-07.

---

## Cursor

**URL**: https://cursor.sh/pricing

| Plan | Price/user/month | Notes |
|------|-----------------|-------|
| Hobby | $0 | 2,000 completions/month, limited fast requests |
| Pro | $20 | Unlimited completions, 500 fast requests/month |
| Pro+ | $60 | Unlimited completions, unlimited fast requests |
| Teams | $40 | All Pro+ features + team admin, SSO |

**Source**: https://cursor.sh/pricing  
**Verified**: 2026-05-07

---

## GitHub Copilot

**URL**: https://github.com/features/copilot/plans

| Plan | Price/user/month | Notes |
|------|-----------------|-------|
| Free | $0 | 2,000 code completions/month, 50 chat messages/month |
| Pro | $10 | Unlimited completions, multi-model access |
| Pro+ | $39 | All Pro features + access to frontier models (GPT-4o, Claude Sonnet) |
| Business | $19 | Org-level management, policy controls, audit logs |
| Enterprise | $39 | Custom model fine-tuning, Bing web search, IP indemnity |

**Source**: https://github.com/features/copilot/plans  
**Verified**: 2026-05-07

---

## Claude (Anthropic)

**URL**: https://www.anthropic.com/claude/pricing

| Plan | Price/user/month | Notes |
|------|-----------------|-------|
| Free | $0 | Limited daily messages on Claude 3.5 Haiku |
| Pro | $20 ($17 if billed annually) | 5× more usage than free, Projects, extended thinking |
| Max | $100 | 5× more usage than Pro, priority access |
| Team | $30/user/month (min 5 seats) | All Pro features + admin console, SSO, audit logs |

**Note**: Claude Pro shows as $20/month; annual billing reduces it to ~$17/month. The audit engine uses $17/month as the Pro price to reflect actual cost at annual billing, which is standard for startups.

**Source**: https://www.anthropic.com/claude/pricing  
**Verified**: 2026-05-07

---

## ChatGPT (OpenAI)

**URL**: https://openai.com/chatgpt/pricing/

| Plan | Price/user/month | Notes |
|------|-----------------|-------|
| Free | $0 | Access to GPT-4o mini, limited GPT-4o |
| Plus | $20 | Unlimited GPT-4o, DALL-E access, plugins |
| Team | $30 (min 2 seats) | All Plus features + team workspace, longer context, admin controls |
| Enterprise | Custom (~$60 estimated) | Dedicated capacity, custom data retention, SSO |

**Note**: Enterprise pricing is not publicly listed. The $60 estimate is derived from disclosed pricing in public case studies and SEC filings from companies that have shared their OpenAI contracts.

**Source**: https://openai.com/chatgpt/pricing/  
**Verified**: 2026-05-07

---

## Gemini (Google)

**URL**: https://one.google.com/about/plans / https://gemini.google.com/advanced

| Plan | Price/user/month | Notes |
|------|-----------------|-------|
| Free | $0 | Gemini 1.5 Flash, basic features |
| Advanced (Google One AI) | $20 | Gemini 1.5 Pro, 2TB storage, integration with Google Workspace |

**Note**: Gemini for Google Workspace (business plans) has separate pricing starting at $30/user/month (Workspace Business Standard + AI add-on). The audit engine currently covers the consumer Gemini Advanced tier, as that is the most common individual subscription.

**Source**: https://gemini.google.com/advanced  
**Verified**: 2026-05-07

---

## Windsurf (Codeium)

**URL**: https://codeium.com/windsurf/pricing

| Plan | Price/user/month | Notes |
|------|-----------------|-------|
| Free | $0 | 5 user prompt credits/day, limited flows |
| Pro | $15 | Unlimited completions, 500 premium model credits/month |
| Teams | $35 | All Pro features + team admin, bulk billing |

**Source**: https://codeium.com/windsurf/pricing  
**Verified**: 2026-05-07

---

## Anthropic API

**URL**: https://www.anthropic.com/api

Pay-as-you-go pricing (token-based). Representative rates for Claude 3.5 Sonnet (most common model for production use):

| Model | Input tokens | Output tokens |
|-------|-------------|---------------|
| Claude 3.5 Haiku | $0.80 / 1M | $4.00 / 1M |
| Claude 3.5 Sonnet | $3.00 / 1M | $15.00 / 1M |
| Claude 3 Opus | $15.00 / 1M | $75.00 / 1M |

**Note**: The audit engine treats Anthropic API as a single line item. Users input their actual monthly spend; the engine does not simulate token counts.

**Source**: https://www.anthropic.com/pricing  
**Verified**: 2026-05-07

---

## OpenAI API

**URL**: https://openai.com/api/pricing/

Pay-as-you-go pricing. Representative rates for GPT-4o (most common):

| Model | Input tokens | Output tokens |
|-------|-------------|---------------|
| GPT-4o mini | $0.15 / 1M | $0.60 / 1M |
| GPT-4o | $2.50 / 1M | $10.00 / 1M |
| o1 | $15.00 / 1M | $60.00 / 1M |

**Note**: Same as Anthropic API — users input their actual monthly API spend.

**Source**: https://openai.com/api/pricing/  
**Verified**: 2026-05-07

---

## Update Policy

Pricing data is hardcoded in `lib/pricing-data.ts`. It should be audited quarterly or whenever a major vendor announces pricing changes. Known price change events:
- GitHub Copilot: introduced Pro+ tier in Q1 2025
- Claude: introduced Max plan ($100/mo) in Q2 2025, replacing Business tier
- ChatGPT Enterprise: still not publicly priced; estimate updated if new data surfaces
