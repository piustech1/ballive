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
        sport: {
          bg: '#0A0D14',
          darker: '#06080D',
          surface: '#111622',
          surfaceLight: '#182030',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.18)',
          accent: '#F59E0B',
          accentYellow: '#FACC15',
          neonBlue: '#38BDF8',
          electricBlue: '#2563EB',
          coral: '#F43F5E',
          emerald: '#10B981',
          textMuted: '#94A3B8',
          textSecondary: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.5)',
        'glow-accent': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glow-live': '0 0 15px 2px rgba(34, 197, 94, 0.6)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
