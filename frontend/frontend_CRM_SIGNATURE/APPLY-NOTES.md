# Signature Estates OS — UI v2 overlay (scope C)

Extract this zip **inside `real-estate-os/frontend/`**. It drops a `src/`
folder that overwrites exactly 9 files and adds nothing else.

```powershell
cd C:\Users\91788\Desktop\real-estate-os\frontend
# back out first so you can diff / revert
git add -A ; git commit -m "checkpoint before UI v2"
# then extract the zip here, and:
npm run dev
```

No new dependencies. No `package.json` change. No backend change.

## Files replaced

| File | What changed |
|---|---|
| `src/app/globals.css` | Warm paper-and-ink palette; saffron brand ramp; new `background` / `surface` / `hairline` / `rail` tokens; `.eyebrow`, `.font-display`, `.scrollbar-slim` utilities. Keeps your base layer, scrollbars, `animate-fade-up` and Leaflet polish. |
| `src/app/layout.tsx` | Swaps Inter for DM Sans + DM Mono + Playfair Display via `next/font/google`. `AmbientBackground`, `ThemeProvider`, `AuthProvider` and `Toaster` untouched. |
| `src/components/layout/sidebar.tsx` | Dark rail design, collapsible to an icon rail (remembered in `localStorage`), same `navGroups`, same role filter, same `useAuth` footer. |
| `src/components/layout/navbar.tsx` | Breadcrumb + topbar styling. Still renders your `GlobalSearch`, `NotificationBell`, `ThemeToggle` unchanged. |
| `src/app/dashboard/layout.tsx` | Adds a max-width container and the fade-up entrance. `RouteGuard` untouched. |
| `src/app/dashboard/page.tsx` | Real dashboard: KPI row, pipeline bars, recent leads, today's follow-ups. |
| `src/app/dashboard/leads/page.tsx` | Kanban with All/My filter + search. Same drag-drop and optimistic PATCH. |
| `src/components/leads/kanban-column.tsx` | Stage dot, count pill, drop highlight. |
| `src/components/leads/lead-card.tsx` | Avatar, assignee, property, source pill, price, relative time. |

## Data sources (all real — nothing is mocked)

Dashboard calls, each in its own `Promise.allSettled` slot so one failing
endpoint cannot blank the page:

- `GET /analytics/overview` → active leads, clients, properties, revenue, site visits
- `GET /analytics/conversion-rate` → conversion %
- `GET /leads/board` → pipeline bar counts
- `GET /follow-ups?scope=me` → today's list + overdue banner
- `GET /leads?page=1&limit=5` → recent leads feed

Leads board calls `GET /leads/board` and `PATCH /leads/:id {stage}`, over the
canonical 10 stages from `src/lib/leads.ts` (`LEAD_STAGES`). WON is not
referenced anywhere.

## Theming

Dark mode still runs on `next-themes` (`.dark` class). The semantic tokens
flip inside `@layer base .dark {}` in `globals.css`, so `bg-background`,
`bg-surface`, `bg-surface-muted` and `border-hairline` switch automatically
and your existing `dark:` utilities keep working.

Note: `bg-background` / `text-foreground` were already used in your
`layout.tsx` and `ambient-background.tsx` but `--color-background` was never
defined in `@theme` — those classes were silently dead. They are defined now.

## Verified

- `npx tsc --noEmit` → clean
- `npx next build` → all 35 routes compile

## Rollback

```powershell
git checkout -- src/
```
