import React, { type HtmlHTMLAttributes } from "react";

const LogoutIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
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
      <path d="M25.3333 14.6667H14.6667V17.3333H25.3333V21.3333L32 16L25.3333 10.6667V14.6667ZM26.6667 24H23.056C21.5164 25.3578 19.6178 26.2425 17.5878 26.5479C15.5579 26.8534 13.483 26.5666 11.612 25.722C9.74102 24.8774 8.15349 23.5109 7.03991 21.7864C5.92633 20.0619 5.334 18.0528 5.334 16C5.334 13.9472 5.92633 11.938 7.03991 10.2136C8.15349 8.4891 9.74102 7.12258 11.612 6.27799C13.483 5.4334 15.5579 5.14662 17.5878 5.45207C19.6178 5.75752 21.5164 6.64221 23.056 7.99999H26.6667C25.4258 6.34289 23.8156 4.99801 21.9639 4.07218C20.1123 3.14636 18.0702 2.6651 16 2.66666C8.636 2.66666 2.66667 8.63599 2.66667 16C2.66667 23.364 8.636 29.3333 16 29.3333C18.0702 29.3349 20.1123 28.8536 21.9639 27.9278C23.8156 27.002 25.4258 25.6571 26.6667 24Z" />
    </svg>
  );
};

export default LogoutIcon;
