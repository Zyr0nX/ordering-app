import React, { type HtmlHTMLAttributes } from "react";


const TrashCanIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.5001 3.5V4.66667H4.66675V7H5.83341V22.1667C5.83341 22.7855 6.07925 23.379 6.51683 23.8166C6.95442 24.2542 7.54791 24.5 8.16675 24.5H19.8334C20.4523 24.5 21.0457 24.2542 21.4833 23.8166C21.9209 23.379 22.1667 22.7855 22.1667 22.1667V7H23.3334V4.66667H17.5001V3.5H10.5001ZM10.5001 9.33333H12.8334V19.8333H10.5001V9.33333ZM15.1667 9.33333H17.5001V19.8333H15.1667V9.33333Z"
      />
    </svg>
  );
};

export default TrashCanIcon;