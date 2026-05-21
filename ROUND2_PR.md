## What this PR does

This PR makes SpendLens audits live after they are shared. Completed audits now store the original tool stack, audit result, and pricing snapshot, then a manual detection endpoint can flag stale audits when the current pricing data changes.

Affected users receive a consolidated re-audit email with a one-click link. That link opens a diff view showing the old audit beside the newly computed audit, with the total savings delta as the headline.

## Why

AI tool pricing changes quickly, so a one-time savings recommendation can become stale or misleading. The user who benefits most is someone who trusted a previous SpendLens audit and needs to know when the economics of that recommendation changed.

I assumed Round 2 should preserve the Round 1 low-friction funnel: users can still run an audit before giving an email, and the email is backfilled later when they request the shareable result.

## How it works

Pricing is still maintained manually in `lib/pricing-data.ts`. The update workflow is: edit pricing data, redeploy, then trigger `POST /api/detect-changes` with the `CRON_SECRET` bearer token.

When `/api/audit` creates an audit, it also writes an `audit_snapshots` row containing the audit UUID, anonymous tools input, deterministic audit output, and the exact pricing snapshot used. When `/api/leads` captures an email for the share link, it backfills `audit_snapshots.user_email`.

`/api/detect-changes` loads non-stale snapshots with email addresses, compares each stored `pricing_snapshot` against the current `PRICING_DATA`, re-runs `runAudit`, marks affected snapshots stale, records pricing history rows, groups stale audits by user email, and sends one Resend email per user. The email includes exact pricing changes, recommendation impacts, a signed audit-specific re-run link, and a one-click unsubscribe link.

`/api/reaudit` validates the token, loads the specific stale audit from the email link, re-runs `runAudit` against current pricing, and returns old/new summaries. `app/reaudit/page.tsx` renders the savings delta and highlights changed tool recommendations. `/pricing-changes` lists detected market changes from the `pricing_changes` table.

## What I cut

- I did not add live vendor pricing API integrations because most vendors do not expose stable public pricing APIs, and manual pricing edits were allowed by the prompt.
- I did not add live email click-through analytics because that requires redirect tracking and a separate event model; I prioritized unsubscribe and audit-specific links.
- I did not add a full queue-backed worker. Instead, `/api/detect-changes?limit=25` batches user email groups per request, which is simpler and enough for this demo.
- I did not replace the Round 1 share-token URL scheme yet, even though the prompt prefers the public audit ID and stored audit ID to be the same. I kept the existing share URL behavior to avoid breaking Round 1 links.

## How to test it manually

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `REAUDIT_SECRET`, `CRON_SECRET`, and `NEXT_PUBLIC_APP_URL`.
2. Apply the Supabase migrations, including `supabase/migrations/002_audit_snapshots.sql`.
3. Run the app with `npm run dev`.
4. Go to `/start`, submit an audit that includes Cursor Pro, Claude Pro, or another priced tool, and land on the shareable `/audit/[shareToken]` page.
5. Submit the lead form with a real test email address so `/api/leads` can backfill the snapshot email.
6. Edit `lib/pricing-data.ts`, for example change Cursor Pro from `20` to `25`, then redeploy or restart the local app.
7. Trigger detection with `POST /api/detect-changes?limit=25` and header `Authorization: Bearer <CRON_SECRET>`.
8. Confirm the JSON response reports affected audits and one sent email for the user.
9. Open the re-audit link from the email.
10. Confirm `/reaudit` shows the old audit, the new audit, highlighted recommendation differences, and the total savings delta.
11. Open `/pricing-changes` and confirm the pricing change was recorded.
12. Click the unsubscribe link from the email, then trigger detection again with another test audit to confirm that email is skipped.

## What's tested

- Existing `tests/audit-engine.test.ts` still passes and covers the deterministic audit engine behavior used by the re-audit flow.
- Added `tests/pricing-change-detection.test.ts` for changed prices, added/removed plans, stack filtering, and recommendation diffs.
- `npm run lint` passes.
- `npx tsc --noEmit` passes after the Round 2 type fixes.
- I have not yet added endpoint-level tests for `/api/detect-changes`, `/api/reaudit`, email grouping, or Supabase persistence. Those are the first automated tests I would add next.

## Open questions / risks

- The detection now filters direct price changes to the user's selected plan, but added plans for a selected tool can still create conservative notifications.
- Email sending still happens inside the request lifecycle. The `limit` parameter helps, but a large customer base needs durable jobs and idempotency keys.
- Public pricing history depends on detection runs. If pricing data is edited but detection is not triggered, `/pricing-changes` will not update.
