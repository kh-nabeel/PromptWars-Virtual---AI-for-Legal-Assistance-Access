/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      colors: {
        bg: '#F7F8FC',
        surface: '#FFFFFF',
        ink: '#1F2421',
        navy: {
          950: '#060d1a',
          900: '#0a1628',
          800: '#0f2040',
          700: '#16324F',
          600: '#1b3e62',
          500: '#2255842',
        },
        primary: {
          DEFAULT: '#16324F',
          hover: '#1b3e62',
        },
        accent: {
          DEFAULT: '#C99A2E',
          hover: '#dfae36',
          light: '#f5e5b0',
        },
        risk: {
          high: '#B3432B',
          medium: '#D97706',
          low: '#4B7B62',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #060d1a 0%, #0a1628 40%, #16324F 70%, #1b3e62 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C99A2E 0%, #dfae36 50%, #f5c842 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse_slow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-up-delay': 'fadeUp 0.6s ease-out 0.2s forwards',
        'fade-up-delay2': 'fadeUp 0.6s ease-out 0.4s forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-left': 'slideInLeft 0.5s ease-out forwards',
        'pulse-slow': 'pulse_slow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 4s ease-in-out infinite',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(201,154,46,0.15)',
        'glow-lg': '0 0 80px rgba(201,154,46,0.2)',
        'card': '0 4px 24px rgba(22,50,79,0.08), 0 1px 4px rgba(22,50,79,0.05)',
        'card-hover': '0 12px 40px rgba(22,50,79,0.15), 0 4px 12px rgba(22,50,79,0.08)',
      },
    },
  },
  plugins: [],
}
