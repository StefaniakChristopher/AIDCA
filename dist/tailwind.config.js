/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        backgroundPrimary: "#01295F",
        backgroundSecondary: "#559BEB",
        fontColorPrimary: "#F15BB5",
        fontColorSecondary: "#21FA90",
        backupColor: "#013F93"
      }
    },
  },
  plugins: [],
}