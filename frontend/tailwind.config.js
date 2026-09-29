/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#31AAA9',      // Teal
          secondary: '#F8E0A4',    // Cream
          danger: '#A82020',       // Red / Lagging
          dark: '#6C1A1A',         // Dark Red Accent
          bg: '#F8FAFC',           // Crisp Light Background
          card: '#FFFFFF',
          text: '#0F172A',
          subtext: '#475569',
          border: '#E2E8F0',
          success: '#10B981',
          warning: '#F59E0B'
        },
      },
    },
  },
  plugins: [],
}
