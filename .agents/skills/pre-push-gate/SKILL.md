---
name: pre-push-gate
description: Run before EVERY git push: build, secret scan, API-contract check, then clean push and live verification.
---
# pre-push-gate
1. `npm run build` — must finish with zero errors and zero new type errors.
2. Secret scan: `git diff --cached` must contain no .env files, keys, tokens, or passwords (grep for: SUPABASE_, R2_, sk_, ghp_, AKIA, api_key, secret).
3. API-contract check: for every fetch() changed in this diff, confirm the matching exported method exists in its route.ts (this prevents 405 bugs).
4. Commit with a clear message and push cleanly to GitHub (main).
5. Immediately run the verify-live skill and include its table in the final report.
