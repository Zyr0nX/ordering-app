/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        75: "18.75rem",
      },
      minWidth: {
        160: "40rem",
        45: "11.25rem",
        26: "6.5rem"
      },
      maxWidth: {
        360: "90rem",
        259: "64.75rem",
        75: "18.75rem",
        "4/5": "80%",
        90: "22.5rem"
      },
      minHeight: {
        12: "3rem"
      },
      transitionProperty: {
        "min-max-width": "min-width, max-width",
        "max-width-opacity": "max-width, opacity",
      },
      transitionDuration: {
        400: "400ms",
      },
      transitionTimingFunction: {
        normal: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
      },
      spacing: {
        75: "18.75rem",
      },
      lineHeight: {
        7.5: "30px"
      },
    },
  },
};
