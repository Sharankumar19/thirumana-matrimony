import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        cream: {
          50: '#fdf8f0',
          100: '#faefd8',
          200: '#f5ddb0',
          300: '#eec47f',
          400: '#e6a44d',
          500: '#df8a2c',
        },
        maroon: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#8b1a4a',
          600: '#731440',
          700: '#5c1035',
          800: '#4a0d2b',
          900: '#380a21',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 50%, #faefd8 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
        'premium-gradient': 'linear-gradient(135deg, #8b1a4a 0%, #e11d48 50%, #f43f5e 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px rgba(139, 26, 74, 0.08)',
        'card-hover': '0 8px 40px rgba(139, 26, 74, 0.15)',
        'button': '0 4px 15px rgba(225, 29, 72, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
