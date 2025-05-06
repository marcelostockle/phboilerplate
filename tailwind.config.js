// tailwind.config.js
import primeui from 'tailwindcss-primeui';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/primevue/**/*.{js,vue}'
  ],
  darkMode: ['class'], // o 'media' según tu preferencia
  theme: {
    extend: {},
  },
  plugins: [primeui],
}
