/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        script: ['"Alex Brush"', 'cursive'],
      },
      colors: {
        varna: {
          green: '#1a2e1a',
          cream: '#e8d5b7',
          bg: '#faf8f4',
          ticker: '#f0ece4',
          red: '#e05c4b',
          orange: '#d4650a',
        },
      },
    },
  },
  plugins: [],
}
