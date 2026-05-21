## What this PR does

This PR makes SpendLens audits live after they are shared. Completed audits now store the original tool stack, audit result, and pricing snapshot, then a manual detection endpoint can flag stale audits when the current pricing data changes.

Affected users receive a consolidated re-audit email with a one-click link. That link opens a diff view showing the old audit beside the newly computed audit, with the total savings delta as the headline.

## Why

AI tool pricing changes quickly, so a one-time savings recommendation can become stale or misleading. The user who benefits most is someone who trusted a previous SpendLens audit and needs to know when the economics of that recommendation changed.

I assumed Round 2 should preserve the Round 1 low-friction funnel: users can still run an audit before giving an email, and the email is backfilled later when they request the shareable result.

## How it works

Pricing is still maintained manually in `lib/pricing-data.ts`. The update workflow is: edit pricing data, redeploy, then trigger `POST /api/detect-changes` with the `CRON_SECRET` bearer token.

When `/api/audit` creates an audit, it also writes an `audit_snapshots` row containing the audit UUID, anonymous tools input, deterministic audit output, and the exact pricing snapshot used. When `/api/leads` captures an email for the share link, it backfills `audit_snapshots.user_email`.

`/api/detect-changes` loads non-stale snapshots with email addresses, compares each stored `pricing_snapshot` against the current `PRICING_DATA`, marks affected snapshots stale, groups stale audits by user email, and sends one Resend email per user. The email includes the affected tools and a signed `/reaudit?email=...&token=...` link generated with an HMAC secret.

`/api/reaudit` validates the token, loads the latest stale audit for that email, re-runs `runAudit` against current pricing, and returns old/new summaries. `app/reaudit/page.tsx` renders the savings delta and highlights changed tool recommendations.

## What I cut

- I did not add live vendor pricing API integrations because most vendors do not expose stable public pricing APIs, and manual pricing edits were allowed by the prompt.
- I did not add unsubscribe links in the first pass because the required storage, detection, notification, and diff loop had to work first.
- I did not add the public pricing changes page in the first pass because the private re-audit loop was more important to the evaluator’s end-to-end test.
- I did not add a queue-backed email worker in the first pass. The current endpoint sends user groups sequentially, which is acceptable for a demo but should be batched or queued before production scale.
- I did not replace the Round 1 share-token URL scheme yet, even though the prompt prefers the public audit ID and stored audit ID to be the same. I kept the existing share URL behavior to avoid breaking Round 1 links.

## How to test it manually

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `REAUDIT_SECRET`, `CRON_SECRET`, and `NEXT_PUBLIC_APP_URL`.
2. Apply the Supabase migrations, including `supabase/migrations/002_audit_snapshots.sql`.
3. Run the app with `npm run dev`.
4. Go to `/start`, submit an audit that includes Cursor Pro, Claude Pro, or another priced tool, and land on the shareable `/audit/[shareToken]` page.
5. Submit the lead form with a real test email address so `/api/leads` can backfill the snapshot email.
6. Edit `lib/pricing-data.ts`, for example change Cursor Pro from `20` to `25`, then redeploy or restart the local app.
7. Trigger detection with `POST /api/detect-changes` and header `Authorization: Bearer <CRON_SECRET>`.
8. Confirm the JSON response reports affected audits and one sent email for the user.
9. Open the re-audit link from the email.
10. Confirm `/reaudit` shows the old audit, the new audit, highlighted recommendation differences, and the total savings delta.

## What's tested

- Existing `tests/audit-engine.test.ts` still passes and covers the deterministic audit engine behavior used by the re-audit flow.
- `npm run lint` passes.
- `npx tsc --noEmit` passes after the Round 2 type fixes.
- I have not yet added endpoint-level tests for `/api/detect-changes`, `/api/reaudit`, email grouping, or Supabase persistence. Those are the first automated tests I would add next.

## Open questions / risks

- The current detection compares all stored pricing against all current pricing and may notify users about plan changes that do not affect their specific plan.
- The re-audit link currently loads the latest stale audit for an email, not a specific audit ID, so a user with multiple stale audits may not land on the exact one referenced.
- Email sending happens inside the request lifecycle. A large customer base needs batching, idempotency, and a queue-backed worker.
