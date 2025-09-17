/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Be Vietnam Pro', 'Poppins', 'ui-sans-serif', 'system-ui'],
        script: ['Great Vibes', 'cursive']
      },
      colors: {
        primary: '#f9d342',
      }
    },
  },
  plugins: [],
}
