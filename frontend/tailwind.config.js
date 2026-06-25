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
        background: '#070709',
        foreground: '#f4f4f5',
        surface: {
          DEFAULT: '#0f0f13',
          hover: '#181822',
          border: '#1f1f2e',
        },
        primary: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
        secondary: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#34d399',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        muted: {
          DEFAULT: '#71717a',
          foreground: '#a1a1aa',
        },
        darkborder: '#1e293b',
        border: '#27272a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
