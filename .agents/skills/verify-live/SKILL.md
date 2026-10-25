---
name: verify-live
description: Use after deploying to https://vigilamc.vercel.app to prove the change is live and nothing regressed. Produces an HTTP-code results table. Do not use for local-only work.
---
# verify-live
1. Ask which surfaces changed (or diff the task). For each changed API route, curl every method the UI uses against https://vigilamc.vercel.app and record codes (protected endpoints must be 401 logged-out, NEVER 405/404).
2. Fetch the route HTML, extract the new hashed /_next/static/chunks bundle names, download them, and grep for the fixed strings + absence of banned strings.
3. Regression: GET /, /login, /dashboard, /technician, /sample-report, /api/health = 200.
4. Print the results table and an overall PASS/FAIL. If FAIL, say exactly which probe broke.
