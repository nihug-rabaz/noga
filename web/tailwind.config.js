/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nogaBg: "#050816",
        nogaAccent: "#7f5af0",
        nogaAccentSoft: "#2cb67d"
      }
    }
  },
  plugins: []
};

