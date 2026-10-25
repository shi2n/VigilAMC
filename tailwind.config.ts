import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flame: {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          active: '#9A3412',
        },
        ember: {
          DEFAULT: '#FF8C42',
          tint: '#FFF4EC',
          warm: '#FFF8F2',
          border: '#FED7AA',
        },
        'charcoal-ink': '#1C1917',
        'charcoal-body': '#44403C',
        'bg-warm': '#FFF8F2',
        signal: {
          expired: '#DC2626',
          due: '#D97706',
          ok: '#059669',
          pending: '#64748B',
        },
        /* Legacy utility scales re-mapped to VIGILAMC FIRE palette */
        ocean: {
          50: '#FFF8F2',
          100: '#FFF0E6',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FF8C42',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407',
          950: '#1C1917',
        },
        navy: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#A8A29E',
          400: '#57534E',
          500: '#C2410C',
          600: '#9A3412',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#1C1917',
        },
        cyanAccent: {
          50: '#FFF8F2',
          100: '#FFF0E6',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FF8C42',
          500: '#EA580C',
        },
        fire: {
          50: '#FFF8F2',
          100: '#FFF0E6',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FF8C42',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407',
          950: '#1C1917',
        },
        safety: {
          amber: '#D97706',
          emerald: '#059669',
          blue: '#C2410C',
          dark: '#1C1917',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-sora)', '"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 24px 60px -24px rgba(28, 25, 23, 0.16), 0 0 60px rgba(232, 89, 12, 0.10)',
        'card-hover': 'inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 24px 60px -20px rgba(28, 25, 23, 0.22), 0 0 60px rgba(232, 89, 12, 0.18)',
        'elevated': 'inset 0 1px 0 rgba(255, 255, 255, 0.88), 0 24px 60px -24px rgba(28, 25, 23, 0.18), 0 0 60px rgba(232, 89, 12, 0.12)',
        'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 24px 60px -24px rgba(28, 25, 23, 0.18)',
        'glass-ember-glow': '0 0 60px rgba(232, 89, 12, 0.12)',
        'glow-ocean': '0 0 32px rgba(232, 89, 12, 0.35)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(calc(-100% - var(--gap, 0.75rem)), 0, 0)' },
        },
      },
      animation: {
        marquee: 'marquee var(--duration, 28s) linear infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
