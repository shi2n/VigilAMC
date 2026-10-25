---
trigger: always_on
description: Banned silent failures; required toast + revert + refetch patterns
---
# Error Handling Standard
BANNED: `catch(e){ console.error(e) }` as the only response to a failed mutation or load.
Required pattern for optimistic updates:
1. Snapshot state -> apply optimistic change -> call API.
2. If `!res.ok` -> revert to snapshot -> show toast with the server's error message -> re-fetch.
3. On network error -> same: revert + toast + offer retry.
Required for data loads: surface failures in an on-screen banner (never console-only).
Success toasts must state exactly what happened (e.g. "Work order status updated to COMPLETED").
Modals must stay OPEN when create/update fails; only close on success.
