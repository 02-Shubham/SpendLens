## 2026-05-20 10:00 - Start

Read the Round 2 assignment and mapped it against the Round 1 flow. The main constraint is preserving the anonymous audit experience while still storing enough data to notify users later.

## 2026-05-20 10:25 - Decided on storage shape

Chose a new `audit_snapshots` table instead of changing the existing `audits` table heavily. The snapshot stores `tools_input`, `audit_result`, and `pricing_snapshot` so stale audits can be compared against future pricing.

## 2026-05-20 10:50 - Anonymous-to-email bridge

Decided to create snapshots with `user_email: null` during audit creation, then backfill the email when the user submits the lead capture form. This keeps the Round 1 conversion path intact.

## 2026-05-20 11:20 - Audit snapshot writes

Updated `/api/audit` to insert into `audit_snapshots` after the main audit row is created. Kept snapshot failures non-fatal so the user can still get an audit even if the secondary write fails.

## 2026-05-20 11:45 - Lead backfill

Updated `/api/leads` to find the audit by `shareToken`, save the email to `audits`, then update the matching `audit_snapshots` row. This gives the pricing detection job an email address only after the user asks for the result.

## 2026-05-20 12:15 - Detection endpoint

Created `POST /api/detect-changes` with optional `CRON_SECRET` protection. It fetches non-stale snapshots with emails and compares stored pricing against the current `PRICING_DATA`.

## 2026-05-20 12:45 - Email helper

Added `lib/emails/reaudit-notification.ts` using Resend. Used a stateless HMAC token for re-audit links to avoid creating a separate token table during the first pass.

## 2026-05-20 13:20 - Re-audit API

Built `/api/reaudit` to validate the token, load the latest stale snapshot, and re-run `runAudit` with the old input stack and current pricing data.

## 2026-05-20 14:00 - Diff UI

Created `/reaudit` with a savings delta headline and per-tool old/new recommendation cards. Highlighted changed rows and muted unchanged rows.

## 2026-05-20 14:40 - First documentation pass

Wrote initial `ROUND2_PR.md`, `ROUND2_DEVLOG.md`, and `ROUND2_REFLECTION.md`. The docs captured the architecture but did not yet match the exact required section headings.

## 2026-05-21 23:05 - Status review

Reviewed the repo before preparing a PR. Found the Round 2 work was uncommitted, the branch already existed, TypeScript failed, and the required docs needed restructuring.

## 2026-05-21 23:20 - Blocker cleanup

Fixed the TypeScript blockers in the pricing comparison and re-audit page state handling. Rewrote the PR notes into the required structure and expanded this devlog into timestamped entries.
