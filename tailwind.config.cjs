/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    minWidth: {
      '160': '40rem',
      '45': '11.25rem'
    },
    maxWidth: {
      '360': '90rem',
      '259': '64.75rem',
      '75': '18.75rem'
    },
    extend: {
      transitionProperty: {
        'min-max-width': 'min-width, max-width',
        'max-width-opacity': 'max-width, opacity'
      },
      transitionDuration: {
        '400': '400ms'
      },
      transitionTimingFunction: {
        'normal': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'in-out': 'cubic-bezier(0.42, 0, 0.58, 1)'
      }
    },
  },
};
