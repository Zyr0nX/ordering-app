import React, { type HtmlHTMLAttributes } from "react";

const HalfStarIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      width="19"
      height="18"
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        opacity="0.5"
        d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z"
        fill="white"
      />
      <path
        d="M9.5 0L9.5 13.1287L3.91604 17.1857L6.04893 10.6213L0.464966 6.56434H7.36712L9.5 0Z"
        fill="white"
      />
    </svg>
  );
};

export default HalfStarIcon;