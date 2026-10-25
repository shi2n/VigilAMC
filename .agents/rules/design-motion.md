---
trigger: always_on
description: Design + animation standard for VigilAMC (brand tokens, motion budgets, accessibility)
---
# Design & Motion Standard
1. Brand tokens only (Dual-Brand System):
   - **Public marketing surfaces** (`/`, `SiteLayout` navbar/footer, `/opengraph-image`): VIGILAMC FIRE palette — page base `#FFFFFF` / alternating `#FFF8F2` (soft tint `#FFF4EC`), cards `#FFFFFF`, borders `#FED7AA` / `rgba(232,89,12,0.18)`, primary Fire Orange `#EA580C`, Ember Deep `#C2410C`, Ember Glow `#FF8C42`, Charcoal headings/footer `#1C1917`, body text `#44403C`, dark band text `#FAFAF9` / muted `#A8A29E`.
   - **Product surfaces** (`/dashboard`, `/technician`, `/report`, `/login`): existing Blue palette — bg `#F4F8FB`, cards `#FFFFFF`, borders `#DCE7F2`, primary `#0077B6`, deep `#023E8A`, accent `#EAF6FF`.
   - **Shared status tokens**: success `#0E9F6E`, danger `#B91C1C`. Any component copied from Magic UI / Aceternity / 21st.dev / React Bits MUST be re-themed to these tokens before shipping (strip purple/neon defaults). Dark themes and `bg-slate-950` remain banned everywhere.
2. Motion budgets: dashboard transitions 150-300ms (ease-out or spring, no bouncy overshoot on data tables); /technician field app: fades/slides only, <=150ms, NO canvas/WebGL/particle effects (cheap Android phones in basements); /report viewer: NO screen animations inside @media print and no layout-shifting motion.
3. Every animated component MUST respect prefers-reduced-motion (disable transform/particle motion, keep opacity).
4. Performance: no animation may cause layout shift or block input; tables animate rows once on mount, never on every render; no infinite animations on data-heavy screens except subtle loading skeletons.
5. Accessibility: contrast >= 4.5:1 for text; nothing flashes more than 3x/second; focus rings stay visible on all interactive elements.
6. Skeleton shimmer (brand-blue tinted) for ALL loading states; sonner toasts for all success/error feedback (per error-handling rule).
