/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cf-blue': {
          DEFAULT: '#1E88E5',
          dark: '#1E88E5',
          light: '#1976D2',
        },
        'cf-dark': {
          DEFAULT: '#1B1B1B',
          dark: '#1B1B1B',
          light: '#F5F5F5',
        },
        'cf-gray': {
          DEFAULT: '#2D2D2D',
          dark: '#2D2D2D',
          light: '#E0E0E0',
        },
        'cf-light': {
          DEFAULT: '#F5F5F5',
          dark: '#F5F5F5',
          light: '#FFFFFF',
        },
        'cf-text': {
          DEFAULT: '#E0E0E0',
          dark: '#E0E0E0',
          light: '#333333',
        },
        'cf-link': {
          DEFAULT: '#4FC3F7',
          dark: '#4FC3F7',
          light: '#0288D1',
        },
        'cf-success': '#4CAF50',
        'cf-warning': '#FFC107',
        'cf-error': '#F44336',
      },
      fontFamily: {
        'cf': ['Consolas', 'Monaco', 'monospace'],
        'cf-sans': ['Arial', 'sans-serif'],
      },
      boxShadow: {
        'cf': '0 2px 4px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 