/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#0a0e17',
          900: '#0d1221',
          800: '#12182a',
          700: '#1a2338',
        },
        gold: {
          900: '#451a03',
          800: '#78350f',
          700: '#92400e',
          600: '#b45309',
          500: '#d97706',
          400: '#f59e0b',
          300: '#fbbf24',
          200: '#fde68a',
          100: '#fef3c7',
          50:  '#fffbeb',
        },
        navy: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        glass: {
          border: 'rgba(255, 255, 255, 0.08)',
          'border-gold': 'rgba(217, 119, 6, 0.3)',
          bg: 'rgba(18, 24, 38, 0.75)',
          'bg-hover': 'rgba(26, 35, 56, 0.85)',
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
        'dark-gradient': 'radial-gradient(circle at 15% 20%, rgba(217, 119, 6, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 70%, rgba(6, 182, 212, 0.06) 0%, transparent 45%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(217, 119, 6, 0.35)',
        'gold-hover': '0 6px 25px rgba(217, 119, 6, 0.5)',
        'glass': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'gold-shadow': '0 0 30px rgba(217, 119, 6, 0.15)',
      },
      backdropBlur: {
        xs: '4px',
      },
      borderRadius: {
        'xl2': '20px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}
