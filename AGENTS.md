# AGENTS.md — VigilAMC (read before every task)
Live site: https://vigilamc.vercel.app
Stack: Next.js App Router + TypeScript + Tailwind CSS + Prisma + Supabase Auth + PostgreSQL + Cloudflare R2 + Vercel.

## Commands
- Build: `npm run build` (MUST pass with zero errors before every push)
- Dev: `npm run dev` — Lint: `npm run lint` (if configured)

## Hard rules (a violation = the task failed)
1. **API contract:** every `fetch("/api/...", {method})` in UI code must have a matching exported handler (GET/POST/PATCH/PUT/DELETE) in the corresponding `app/api/**/route.ts`. Before finishing, grep each changed fetch AND its route file. A method mismatch (405) is a production bug — this bug already happened once with PATCH /api/work-orders.
2. **No silent failures:** every `catch` must (a) show user-visible feedback (toast/banner) and (b) leave no stale optimistic UI — revert to the previous state and re-fetch. `console.error` alone is banned.
3. **Prisma safety:** convert empty form strings to `null` before saving ("" for dates/ids crashes Prisma). Validate enum values against schema.prisma. Scope every query by companyId/tenant.
4. **Secrets:** NEVER commit .env / .env.local / credentials or hardcode keys, tokens, passwords. Check `git diff` for secrets before every push.
5. **Design system (DUAL-BRAND LIGHT system):** Public marketing pages (/, SiteLayout navbar/footer, og-image) use the VIGILAMC FIRE palette (white #FFFFFF/#FFF8F2, fire orange #EA580C/#C2410C/#FF8C42, charcoal #1C1917). Product surfaces (/dashboard, /technician, /report, /login) keep the existing blue system (#F4F8FB, #0077B6, #023E8A) until a later rollout. Dark themes and bg-slate-950 remain banned everywhere (dark: variants banned too).
6. **No QR codes anywhere** in product, reports or docs — use GPS + Asset Tag ID + Floor/Zone checklists + camera photo proof instead.
7. **Pan-India UI:** icon-first design, NO English/Hindi language toggle; support the browser voice-to-text mic for remarks.
8. **Definition of done (every change):** `npm run build` clean -> push to GitHub WITHOUT secrets -> VERIFY LIVE on https://vigilamc.vercel.app (curl the changed endpoints + pages and report HTTP codes) -> report results. Never stop at localhost.
9. **Numbers/KPIs:** guard null dates; use explicit time windows; NEVER fall back to all-time counts when a window count is 0; show "No due date set" instead of NaN.
10. **No regressions:** never break /dashboard, /technician, /report/[buildingId], /login, or the public site when editing shared code. After changes, confirm these routes return HTTP 200.

## Vocabulary (check schema before assuming)
Work Order status: OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED.
Equipment status: VERIFIED | DUE_SOON | OVERDUE | SERVICE_REQUIRED | REPLACEMENT_REQUIRED.
