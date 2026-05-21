/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#0A0A0A',
        'bg-2': '#111110',
        'surface': '#141312',
        'surface-2': '#1A1816',
        'surface-3': '#221F1B',
        'border': '#2A2724',
        'border-strong': '#3A3530',
        'gold': '#C9A86A',
        'gold-light': '#E8C77E',
        'gold-deep': '#8B6F3F',
        'ink': '#F5F1E8',
        'ink-muted': '#9A9489',
        'ink-faint': '#6A655C',
        'danger': '#C56B5A',
        'success': '#7FA86A',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        roman: ['"Times New Roman"', 'serif']
      }
    },
  },
  plugins: [],
}
