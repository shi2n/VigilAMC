import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0077B6', // Primary Ocean Blue
          600: '#006494',
          700: '#004B6E',
          800: '#00354E',
          900: '#002233',
          950: '#00141F',
        },
        navy: {
          50: '#F1F5F9',
          100: '#E2E8F0',
          200: '#CBD5E1',
          300: '#94A3B8',
          400: '#475569',
          500: '#023E8A', // Dark Navy Accent
          600: '#023474',
          700: '#022A5E',
          800: '#011F48',
          900: '#03045E', // Deep Navy
          950: '#010B1B',
        },
        cyanAccent: {
          50: '#F0FDFA',
          100: '#CAF0F8',
          200: '#90E0EF',
          300: '#48CAE4',
          400: '#00B4D8',
          500: '#0096C7',
        },
        fire: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa1a1',
          400: '#ff6969',
          500: '#fa3838',
          600: '#e71d1d',
          700: '#c21414',
          800: '#a01414',
          900: '#841717',
          950: '#480707',
        },
        safety: {
          amber: '#f59e0b',
          emerald: '#10b981',
          blue: '#2563eb',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(2, 62, 138, 0.05), 0 12px 24px -6px rgba(2, 62, 138, 0.06)',
        'card-hover': '0 16px 36px -8px rgba(0, 119, 182, 0.12), 0 4px 12px -2px rgba(0, 119, 182, 0.06)',
        'elevated': '0 24px 48px -12px rgba(2, 62, 138, 0.14), 0 8px 16px -4px rgba(2, 62, 138, 0.06)',
        'glass': '0 8px 30px rgba(2, 62, 138, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        'glow-ocean': '0 0 30px rgba(0, 119, 182, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
