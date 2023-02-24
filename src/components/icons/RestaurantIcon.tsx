import React, { type HtmlHTMLAttributes } from "react";

const RestaurantIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      width="59"
      height="60"
      viewBox="0 0 59 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M45.66 59.3333H50.0867C52.3267 59.3333 54.1667 57.6 54.4333 55.4133L58.8333 11.4667H45.5V0.666668H40.2467V11.4667H26.9933L27.7933 17.7067C32.3533 18.96 36.62 21.2267 39.18 23.7333C43.02 27.52 45.66 31.44 45.66 37.84V59.3333ZM0.166667 56.6667V54H40.2467V56.6667C40.2467 58.1067 39.0467 59.3333 37.5 59.3333H2.83333C1.36667 59.3333 0.166667 58.1067 0.166667 56.6667ZM40.2467 38C40.2467 16.6667 0.166667 16.6667 0.166667 38H40.2467ZM0.166667 43.3333H40.1667V48.6667H0.166667V43.3333Z"
        fill="#2E2C9A"
      />
    </svg>
  );
};

export default RestaurantIcon;
