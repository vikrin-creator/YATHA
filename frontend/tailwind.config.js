/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1873B8',
        'background-light': '#F5F1EA',
        'wellness-purple': '#B65DAA',
        'sunrise-peach': '#F2A27C',
        'soft-lavender': '#B7A9E5',
        'neutral-grey': '#8A8F96',
        'golden-yellow': '#F6C453',
        'soft-sunrise-orange': '#F4A261',
        'coral-sunset-pink': '#E76F51',
        'warm-peach': '#F7B267',
        'moringa-green': '#6A994E',
        'clay-brown': '#8D6E63',
        'organic-beige': '#F5F1EA',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif']
      },
    },
  },
  plugins: [],
}
