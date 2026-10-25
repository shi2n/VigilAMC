---
name: ui-self-test
description: Use after any UI change to click through the changed flow with the Playwright MCP browser and assert zero console errors and zero failed requests. Also proves changed values persist after reload.
---
# ui-self-test
1. Start local dev (`npm run dev`) or use the live site if asked.
2. With Playwright MCP: open the changed page, complete the exact user flow you modified (e.g. change a Work Order status), then RELOAD the page and assert the change persisted.
3. Check the browser console and network log: zero uncaught errors, zero 4xx/5xx caused by the change.
4. Repeat one FAILURE path (e.g. submit invalid input): the UI must show a visible error, not fail silently.
5. Report: flow steps, persistence check, console/network results, PASS/FAIL.
