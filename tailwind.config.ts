import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out forwards',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        'primary-dark': '#663399',
        'primary-med': '#5A4FCF',
        'primary-magenta': '#B53389',
        'primary-blue': '#8A2BE2',
        'green-dark': '#228B22',
        'green-light': '#008000',
        'red-accent': '#FF004F',
        'orange-dark': '#D44500',
        'yellow-bright': '#FFEF00',
        'yellow-amber': '#FFBF00',
        'white-off': '#FEFEFA',
      },
    },
  },
  plugins: [],
};

export default config;
