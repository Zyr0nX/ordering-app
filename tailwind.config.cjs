// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["var(--font-roboto)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        viparyasDarkBlue: "#2722FE",
        viparyasTeal: "#34C7AC",
        virparyasMainBlue: "#2E2C9A",
        virparyasLightBrown: "#C77234",
        virparyasBackground: "#F4F4F4",
        virparyasRed: "#DA4343",
        virparyasLightBlue: "#00B6DE",
        virparyasGreen: "#2C9A44",
        virparyasPurple: "#8F34C7",
        virparyasSeparator: "#E0E0E0",
      },
    },
  },
  plugins: [
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/line-clamp"),
  ],
};
