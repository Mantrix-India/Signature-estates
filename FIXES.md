# Signature Estates OS — bug-fix pass (8 Nov 2026)

Verified: backend `tsc` clean · frontend `tsc` clean · `next build` 37/37 routes ·
end-to-end smoke test against a fresh Postgres with every migration applied.

## 1. Dashboard ↔ Analytics now show the same numbers

**Root cause:** the two pages used different data and different maths.
- Dashboard pipeline counted `/leads/board` (8 stages, NEW/LOST dropped); Analytics used `/lead-funnel` (10 stages).
- "Revenue" was **invoices only**, so V2.2 deal payments never showed — Dashboard said ₹0 while Revenue showed lakhs.
- Analytics used `Promise.all`: if one of 6 requests failed, the page stayed on skeletons forever.
- Analytics still used the old UI (neutral cards), Dashboard the new v2 design.
- Revenue-by-month came back in random order, keyed by UTC month.

**Fix:**
- New `GET /api/analytics/snapshot` → `{ overview, funnel, inventory, revenueByMonth }` in one query batch.
- Both pages load it through one hook (`lib/use-analytics.ts`) and render the **same** components:
  `HeadlineKpis`, `PipelineBars`, `Panel`, `KpiCard`. They can't drift apart any more.
- Revenue collected = PAID invoices + PAID deal payments (shown split on the card). `totalRevenue` keeps its old invoice-only meaning so nothing else breaks.
- Overview adds: `wonLeads`, `lostLeads`, `conversionRate`, `revenue{}`, `pendingPayments`, `deals{}`. Deal money is AGENT-scoped (agents see their own deals).
- Revenue by month: last 12 months, chronological, zero-filled, IST-bucketed, stacked deals + invoices.
- Builder performance now shows real units / available / booked-sold (properties link via `Project`).
- Charts follow light/dark tokens, readable stage labels, auto-refresh when you return to the tab, Refresh button.

## 2. Security / auth

| Bug | Fix |
|---|---|
| `POST /auth/register {role:"ADMIN"}` let **anyone** become admin | Role ignored on sign-up. First user ever = ADMIN, everyone else = AGENT; promote from Settings. |
| Refresh re-issued the **old role** and worked for **deactivated** users | Refresh re-reads the user; inactive → 401; role taken from DB. |
| Role change / deactivation left sessions alive | All refresh tokens revoked on both. |
| Two logins in the same second → identical refresh token → 500 | `jwtid` added; every token is unique. |
| Wrong password on login → page reloaded to /login, error toast lost | Axios skips the refresh flow for `/auth/*` endpoints. |
| Failed refresh left queued requests pending forever (endless spinners) | Queue now rejects on failure. |
| Wrong current password returned 401 (triggered refresh flow) | Returns 400. |
| Emails were case-sensitive (`Name@x.com` ≠ `name@x.com`) | Lower-cased on sign-up, case-insensitive login/duplicate check. |

## 3. Other features

- **Deals ↔ Leads synced:** creating a deal moves an earlier lead to BOOKING; completing a deal moves it to CLOSED (+ client status re-derived). Conversion rate now reflects real sales.
- **Deal create is atomic** (deal + offer acceptance in one transaction).
- **Payments:** a payment created as PAID now gets `paidAt` (it was invisible in monthly revenue); moving PAID → PENDING clears `paidAt`.
- **Revenue page:** commission & pending totals respect the date filter and exclude CANCELLED deals; pending list excludes cancelled deals.
- **Follow-ups "Today/Overdue" were computed in UTC** (server clock) → IST morning tasks showed as overdue. Now uses `APP_TIMEZONE` (default `Asia/Kolkata`).
- **Site-visit notifications** printed UTC times → now IST.
- **Invoices:** random number clash crashed with 500 → retries; 5-digit suffix.
- **Lead tasks:** `/leads/A/tasks/<task of B>` could edit/delete another lead's task → scoped.
- **Recent leads** on dashboard were "recently updated" → now newest created (`?sort=created`).
- **Errors:** Prisma unique / not-found / FK errors returned blank 500s → now 409 / 404 / 409 with a clear message; malformed JSON → 400; validation errors return the first real message.
- **AI service:** malformed Groq replies (missing keys, `"7/10"` scores) crashed summary with KeyError → validated/normalised before caching; search guards non-object replies. `requirements.txt` BOM removed.
- Kanban toast shows "Moved to Site Visit" instead of `SITE_VISIT`.
- Removed `frontend/src/.inspection/` (stale duplicate snapshot + zips). `.gitignore` now ignores `dist/`, `*.zip`, `*.tsbuildinfo`.

## No migrations needed
No schema changes. Just replace files and restart.

Optional new env var (backend): `APP_TIMEZONE=Asia/Kolkata`.
