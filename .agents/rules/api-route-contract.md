---
trigger: always_on
description: Fetch-method vs route-handler contract checklist (prevents 405/404 production bugs)
---
# API Route Contract
Before finishing ANY task that touches API calls or route files:
1. List every fetch() you added or changed: method + URL + body shape.
2. For each, open the route file and confirm the SAME method is exported (e.g. `export async function PATCH(...)`).
3. Confirm the response shape matches what the UI reads (e.g. `{ workOrders: [] }` vs `{ data: [] }`).
4. Confirm auth: protected routes return 401 with JSON `{"error":"Unauthorized"}` for anonymous callers, and the UI handles 401 without silent loops.
5. Convert empty strings to null for optional fields (dates, ids).
6. After deploy, probe every method the UI uses: `curl -X <METHOD> https://vigilamc.vercel.app<url> ...` must NOT return 405/404. Record the codes in your report.
