/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  safelist: [
    // AQI level text colors — bound dynamically via :class in Highlight.vue
    'text-emerald-500',
    'text-yellow-500',
    'text-orange-500',
    'text-red-500',
    'text-purple-500',
  ],
  plugins: [],
}

