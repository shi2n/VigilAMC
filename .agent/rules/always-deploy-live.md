---
trigger: always_on
---

# MANDATORY WORKSPACE RULE: ALWAYS BUILD, PUSH TO GITHUB & VERIFY LIVE ON VERCEL

Whenever the user asks to add, edit, fix, style, or remove ANYTHING in this project, a task is **NOT complete** when it only works locally on `localhost`! You MUST automatically complete ALL 5 steps below at the end of EVERY code change without waiting for the user to ask:

1. **Secret Safety Check:** Ensure `.env`, `.env.local`, `.env.production`, and all API/DB secrets remain ignored in `.gitignore` and are NEVER staged in git.
2. **Local Production Build Check:** Run `npm run build` and fix all TypeScript / Next.js build errors until the build succeeds cleanly (`exit code 0`). Never push unbuilt or broken code to GitHub!
3. **Commit & Push to GitHub:** Run `git add -A`, verify staged files with `git status`, commit with a clear message (`git commit -m "..."`), and push directly to the GitHub remote branch connected to Vercel (`git push origin main` or active production branch).
4. **Ensure Live Deployment on `https://vigilamc.vercel.app`:** If needed (or if Vercel CLI is linked), trigger/wait for the Vercel production build to finish (`npx vercel --prod --yes` or wait ~60s after `git push`), then run `curl -sL https://vigilamc.vercel.app/` to confirm the live website returns HTTP `200` with the updated content live in production.
5. **Report Status Clearly:** End every response with:
   - ✅ **Local Build (`npm run build`):** Passed
   - ✅ **GitHub Push:** Pushed commit `<hash>` to `<branch>`
   - ✅ **Live Production Verified:** Confirmed live at `https://vigilamc.vercel.app`
