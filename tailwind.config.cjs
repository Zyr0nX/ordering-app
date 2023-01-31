// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", ...defaultTheme.fontFamily.sans],
      },
      width: {
        75: "18.75rem",
      },
      minWidth: {
        160: "40rem",
        45: "11.25rem",
        26: "6.5rem",
      },
      maxWidth: {
        360: "90rem",
        259: "64.75rem",
        75: "18.75rem",
        "4/5": "80%",
        90: "22.5rem",
      },
      minHeight: {
        12: "3rem",
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
        7.5: "30px",
      },
      // notus
      minHeight: {
        "screen-75": "75vh",
      },
      fontSize: {
        55: "55rem",
      },
      opacity: {
        80: ".8",
      },
      zIndex: {
        2: 2,
        3: 3,
      },
      inset: {
        "-100": "-100%",
        "-225-px": "-225px",
        "-160-px": "-160px",
        "-150-px": "-150px",
        "-94-px": "-94px",
        "-50-px": "-50px",
        "-29-px": "-29px",
        "-20-px": "-20px",
        "25-px": "25px",
        "40-px": "40px",
        "95-px": "95px",
        "145-px": "145px",
        "195-px": "195px",
        "210-px": "210px",
        "260-px": "260px",
      },
      height: {
        "95-px": "95px",
        "70-px": "70px",
        "350-px": "350px",
        "500-px": "500px",
        "600-px": "600px",
      },
      maxHeight: {
        "860-px": "860px",
      },
      maxWidth: {
        "100-px": "100px",
        "120-px": "120px",
        "150-px": "150px",
        "180-px": "180px",
        "200-px": "200px",
        "210-px": "210px",
        "580-px": "580px",
      },
      minWidth: {
        "140-px": "140px",
        48: "12rem",
      },
      backgroundSize: {
        full: "100%",
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
