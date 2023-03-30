import React, { type HtmlHTMLAttributes } from "react";

const CancelOrderIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      width="54"
      height="43"
      viewBox="0 0 54 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M27 21.5H3M42 3.5H3M42 39.5H3M51 15.5L39 27.5M39 15.5L51 27.5"
        stroke="#2E2C9A"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CancelOrderIcon;
