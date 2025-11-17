/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: '#1a365d',
          white: '#ffffff',
        },
        accent: {
          orange: '#ff6b35',
        },
        gray: {
          light: '#f7fafc',
          medium: '#cbd5e0',
          dark: '#2d3748',
        },
        success: '#48bb78',
        error: '#f56565',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
