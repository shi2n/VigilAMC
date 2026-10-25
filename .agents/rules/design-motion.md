# Design & Motion Standard
1. **Single-Brand FIRE + Glass System**:
   - FIRE palette is the single brand across ALL surfaces (marketing + product). Tokens: flame `#EA580C` (`#C2410C` hover, `#9A3412` active), ember `#FF8C42`, charcoal-ink `#1C1917`, charcoal-body `#44403C`, bg `#FFFFFF` / `#FFF8F2`, signal semantics `#DC2626` (EXPIRED) / `#D97706` (DUE SOON) / `#059669` (OK) / `#64748B` (PENDING).
   - Glass Panel System tokens: `glass-fill: rgba(255,255,255,0.45)` (`0.55` where text-heavy), `glass-blur: backdrop-filter: blur(18px) saturate(1.15)` (`12px` mobile), `glass-border: 1px solid rgba(255,255,255,0.55)` + inner top highlight (`inset 0 1px 0 rgba(255,255,255,0.85)`), `glass-shadow: 0 24px 60px -24px rgba(28,25,23,0.18)`, `glass-ember-glow: 0 0 60px rgba(232,89,12,0.12)` with radial ember glows (`rgba(232,89,12,0.12–0.22)`, `blur 80–120px`) behind glass panels.
   - `/public/manifest.json` + `/public/sw.js` remain untouched (field PWA exception).
   - Any component copied from Magic UI / Aceternity / 21st.dev / React Bits MUST be re-themed to these tokens before shipping (strip purple/neon/old-blue defaults). Dark themes and `bg-slate-950` remain banned everywhere.
2. **Motion & Scroll-Craft Choreography**:
   - Scroll-scrubbed hero depth planes + Ember Line scroll-progress signature + IntersectionObserver section reveals + rAF stat counters + scroll-velocity reactive marquee; `prefers-reduced-motion: reduce` fully supported; transforms/opacity only; `CLS = 0.0000`.
   - Dashboard transitions 150-300ms (ease-out or spring, no bouncy overshoot on data tables); `/technician` field app: no entrance animations under reduced-motion, NO canvas/WebGL/particle effects; `/report` viewer: Ember Line on screen shell, NO screen animations inside `@media print` and no layout-shifting motion.
3. Every animated component MUST respect `prefers-reduced-motion` (disable transform/parallax/scrub/counter/marquee-velocity motion, keep instant opacity 1 + static layouts).
4. Performance: no animation may cause layout shift or block input; tables animate rows once on mount, never on every render; no infinite animations on data-heavy screens except subtle loading skeletons.
5. Accessibility: contrast >= 4.5:1 for body text (3:1 large); primary buttons use `#C2410C` bg + white text (hover `#9A3412`); focus rings (`2px solid #EA580C`, `2px` offset) stay visible on all interactive elements.
6. Skeleton shimmer (warm ember tinted) for ALL loading states; sonner toasts for all success/error feedback (per error-handling rule).
