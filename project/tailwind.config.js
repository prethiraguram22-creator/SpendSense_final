/** @type {import('tailwindcss').Config} */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: channel('canvas'),
        surface: channel('surface'),
        raised: channel('raised'),
        elevated: channel('elevated'),
        line: channel('line'),
        fg: channel('fg'),
        muted: channel('muted'),
        accent: {
          lime: '#bef264',
          emerald: '#34d399',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Manrope', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'glow-lime': '0 0 40px -10px rgba(190, 242, 100, 0.35)',
        'glow-emerald': '0 0 40px -10px rgba(52, 211, 153, 0.35)',
        'glow-cyan': '0 0 40px -10px rgba(34, 211, 238, 0.35)',
        'glass-lg': '0 24px 64px -24px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 18s linear infinite',
      },
    },
  },
  plugins: [],
};
