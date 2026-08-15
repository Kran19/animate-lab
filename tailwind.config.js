/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0D11',
          subtle: '#12151C',
          muted: '#181C26',
          card: '#1A1E2B',
          hover: '#232838',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.12)',
          accent: 'rgba(99, 102, 241, 0.3)',
        },
        accent: {
          DEFAULT: '#6366F1', // Indigo primary
          hover: '#4F46E5',
          light: '#818CF8',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#A855F7',
        },
        text: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.35)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.35)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
