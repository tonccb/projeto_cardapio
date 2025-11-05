/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./**/*.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "home": "url('../assets/background.jpg')",
      }
    },
  },
  plugins: [],
}