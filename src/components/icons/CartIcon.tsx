import React, { type HtmlHTMLAttributes } from "react";

const CartIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      width="27"
      height="28"
      viewBox="0 0 27 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.33334 27.3333C7.60001 27.3333 6.97201 27.072 6.44934 26.5493C5.92668 26.0266 5.66579 25.3991 5.66668 24.6666C5.66668 23.9333 5.92801 23.3053 6.45068 22.7826C6.97334 22.26 7.6009 21.9991 8.33334 22C9.06668 22 9.69468 22.2613 10.2173 22.784C10.74 23.3066 11.0009 23.9342 11 24.6666C11 25.4 10.7387 26.028 10.216 26.5506C9.69334 27.0733 9.06579 27.3342 8.33334 27.3333ZM21.6667 27.3333C20.9333 27.3333 20.3053 27.072 19.7827 26.5493C19.26 26.0266 18.9991 25.3991 19 24.6666C19 23.9333 19.2613 23.3053 19.784 22.7826C20.3067 22.26 20.9342 21.9991 21.6667 22C22.4 22 23.028 22.2613 23.5507 22.784C24.0733 23.3066 24.3342 23.9342 24.3333 24.6666C24.3333 25.4 24.072 26.028 23.5493 26.5506C23.0267 27.0733 22.3991 27.3342 21.6667 27.3333ZM8.33334 20.6666C7.33334 20.6666 6.57779 20.2275 6.06668 19.3493C5.55557 18.4711 5.53334 17.5991 6.00001 16.7333L7.80001 13.4666L3.00001 3.3333H1.63334C1.25557 3.3333 0.944455 3.2053 0.70001 2.9493C0.455566 2.6933 0.333344 2.37685 0.333344 1.99996C0.333344 1.62219 0.461343 1.3053 0.717344 1.0493C0.973343 0.793297 1.28979 0.665742 1.66668 0.666631H3.83334C4.07779 0.666631 4.31112 0.733297 4.53334 0.866631C4.75557 0.999964 4.92223 1.18885 5.03334 1.4333L5.93334 3.3333H25.6C26.2 3.3333 26.6111 3.55552 26.8333 3.99996C27.0556 4.44441 27.0445 4.91108 26.8 5.39996L22.0667 13.9333C21.8222 14.3777 21.5 14.7222 21.1 14.9666C20.7 15.2111 20.2445 15.3333 19.7333 15.3333H9.80001L8.33334 18H23.0333C23.4111 18 23.7222 18.128 23.9667 18.384C24.2111 18.64 24.3333 18.9564 24.3333 19.3333C24.3333 19.7111 24.2053 20.028 23.9493 20.284C23.6933 20.54 23.3769 20.6675 23 20.6666H8.33334Z"
        fill="white"
      />
    </svg>
  );
};

export default CartIcon;
