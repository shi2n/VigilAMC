---
name: ui-glowup
description: Use when asked to beautify, polish, modernize or animate any VigilAMC UI (dashboard, site, field app). Applies trending 2026 motion patterns within the VigilAMC light brand and motion budgets, then requires ui-self-test + verify-live.
---
# ui-glowup
1. Read .agents/rules/design-motion.md and AGENTS.md first. Brand tokens beat any library default.
2. Pick patterns from the installed layer only (shadcn/ui blocks, Magic UI, Aceternity free, React Bits, Motion Primitives-style hand-rolls). Never add a new dependency without asking.
3. Apply changes in this impact order: loading skeletons -> toasts -> KPI/stat cards -> tables/pills -> modals/sheets -> navigation -> page transitions -> empty states. Ship small, verify each.
4. Rules per surface: /dashboard full motion budget; public site: hero/marketing wow allowed (beams, spotlight, text-reveal) but above-the-fold must stay fast; /technician: micro only; /report: print-safe only.
5. When done: run ui-self-test (all flows touched + prefers-reduced-motion emulation), then per AGENTS.md: npm run build -> pre-push-gate -> push -> verify-live. Include before/after screenshots in the report.
