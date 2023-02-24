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
      },
    },
    plugins: [require("@headlessui/tailwindcss")],
  },
};
