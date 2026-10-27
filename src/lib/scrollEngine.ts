'use client';

/**
 * VigilAMC shared scroll engine.
 *
 * One passive scroll/resize listener + one requestAnimationFrame per frame for
 * every homepage scroll effect that subscribes. Effects write transforms/opacity
 * only (never layout properties) so scroll motion can never cause CLS.
 *
 * Also drives declarative parallax: any element with `data-sc-parallax="<rate>"`
 * inside a `data-sc-scene` container drifts on scroll relative to the scene's
 * distance from the viewport centre. Rates are small (0.02–0.12) and the drift is
 * clamped so flying elements never inflate page height or cause horizontal scroll.
 */

export interface ScrollFrame {
  scrollY: number;
  vh: number;
  vw: number;
}

type Subscriber = (frame: ScrollFrame) => void;

const subscribers = new Set<Subscriber>();
let rafId = 0;
let listening = false;
let reducedQuery: MediaQueryList | null = null;

const PARALLAX_CLAMP = 72;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  if (!reducedQuery) reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return reducedQuery.matches;
}

function runParallax(frame: ScrollFrame) {
  const reduced = prefersReducedMotion();
  const scenes = document.querySelectorAll<HTMLElement>('[data-sc-scene]');
  scenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    // Skip scenes far outside the viewport (cheap culling).
    if (rect.bottom < -frame.vh || rect.top > frame.vh * 2) return;
    const sceneCentre = rect.top + rect.height / 2;
    const delta = frame.vh / 2 - sceneCentre;
    const layers = scene.querySelectorAll<HTMLElement>('[data-sc-parallax]');
    layers.forEach((layer) => {
      if (reduced) {
        layer.style.transform = 'none';
        return;
      }
      const rate = Number(layer.dataset.scParallax || 0);
      // Mobile gets a gentler drift so cards stay inside the photo bounds.
      const mobileScale = frame.vw < 1024 ? 0.35 : 1;
      const raw = delta * rate * mobileScale;
      const y = Math.max(-PARALLAX_CLAMP, Math.min(PARALLAX_CLAMP, raw));
      layer.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    });
  });
}

function tick() {
  rafId = 0;
  const frame: ScrollFrame = {
    scrollY: window.scrollY,
    vh: Math.max(600, window.innerHeight),
    vw: window.innerWidth,
  };
  runParallax(frame);
  subscribers.forEach((fn) => fn(frame));
}

function schedule() {
  if (!rafId) rafId = window.requestAnimationFrame(tick);
}

function start() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  prefersReducedMotion();
  reducedQuery?.addEventListener('change', schedule);
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  reducedQuery?.removeEventListener('change', schedule);
  if (rafId) window.cancelAnimationFrame(rafId);
  rafId = 0;
}

/** Subscribe to the shared scroll frame. Returns an unsubscribe function. */
export function subscribeScroll(fn?: Subscriber): () => void {
  if (typeof window === 'undefined') return () => {};
  if (fn) subscribers.add(fn);
  start();
  schedule();
  return () => {
    if (fn) subscribers.delete(fn);
    if (subscribers.size === 0 && !document.querySelector('[data-sc-scene]')) stop();
  };
}

/** Re-run one frame (e.g. after mount when new parallax scenes appear). */
export function refreshScroll() {
  if (typeof window === 'undefined') return;
  start();
  schedule();
}
