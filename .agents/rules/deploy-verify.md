---
trigger: model_decision
description: Post-deploy live verification playbook for vigilamc.vercel.app (run after any deploy)
---
# Live Verification Playbook
1. Probe every endpoint you touched with the methods the UI uses; expected: 200 for public pages/health, 401 for protected APIs when logged out (405/504/500 = bug).
2. Re-download the freshly hashed client bundles from /dashboard and /technician HTML and grep for: your fixed strings, absence of banned strings (bg-slate-950), presence of new handlers.
3. Regression list: GET /, GET /login, GET /dashboard, GET /technician, GET /sample-report, GET /api/health must all return 200.
4. Report a results table: probe | expected | actual | pass/fail.
