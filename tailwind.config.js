/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        jarvis: "#8B5CF6",
        atlas: "#3B82F6",
        sentinel: "#10B981",
        quill: "#F59E0B",
        echo: "#EF4444",
        shield: "#06B6D4",
        forge: "#A855F7",
      },
    },
  },
  plugins: [],
};
