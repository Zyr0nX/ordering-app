import React, { type HtmlHTMLAttributes } from "react";

const AccountIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 5.33334C17.4145 5.33334 18.7711 5.89525 19.7713 6.89544C20.7715 7.89563 21.3334 9.25219 21.3334 10.6667C21.3334 12.0812 20.7715 13.4377 19.7713 14.4379C18.7711 15.4381 17.4145 16 16 16C14.5856 16 13.229 15.4381 12.2288 14.4379C11.2286 13.4377 10.6667 12.0812 10.6667 10.6667C10.6667 9.25219 11.2286 7.89563 12.2288 6.89544C13.229 5.89525 14.5856 5.33334 16 5.33334ZM16 18.6667C21.8934 18.6667 26.6667 21.0533 26.6667 24V26.6667H5.33337V24C5.33337 21.0533 10.1067 18.6667 16 18.6667Z"
        fill="white"
      />
    </svg>
  );
};

export default AccountIcon;
