---
trigger: always_on
description: Design + animation standard for VigilAMC (brand tokens, motion budgets, accessibility)
---
# Design & Motion Standard
1. Brand tokens only: bg #F4F8FB, cards #FFFFFF, borders #DCE7F2, primary #0077B6, deep #023E8A, accent #EAF6FF, success #0E9F6E, danger #B91C1C. Any component copied from Magic UI / Aceternity / 21st.dev / React Bits MUST be re-themed to these tokens before shipping (strip purple/neon defaults).
2. Motion budgets: dashboard transitions 150-300ms (ease-out or spring, no bouncy overshoot on data tables); /technician field app: fades/slides only, <=150ms, NO canvas/WebGL/particle effects (cheap Android phones in basements); /report viewer: NO screen animations inside @media print and no layout-shifting motion.
3. Every animated component MUST respect prefers-reduced-motion (disable transform/particle motion, keep opacity).
4. Performance: no animation may cause layout shift or block input; tables animate rows once on mount, never on every render; no infinite animations on data-heavy screens except subtle loading skeletons.
5. Accessibility: contrast >= 4.5:1 for text; nothing flashes more than 3x/second; focus rings stay visible on all interactive elements.
6. Skeleton shimmer (brand-blue tinted) for ALL loading states; sonner toasts for all success/error feedback (per error-handling rule).
