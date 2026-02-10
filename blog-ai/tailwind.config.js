/** @type {import('tailwindcss').Config} */
// Avoid hyphenated theme keys (e.g. "teal-dark") — they can cause Next dev/build CSS parse errors.
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
