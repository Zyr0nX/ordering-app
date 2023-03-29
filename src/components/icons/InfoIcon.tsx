import React, { type HtmlHTMLAttributes } from "react";

const InfoIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 34 34"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17.0002 25.333C17.4724 25.333 17.8685 25.173 18.1885 24.853C18.5074 24.5341 18.6668 24.1386 18.6668 23.6663V16.958C18.6668 16.4858 18.5074 16.0969 18.1885 15.7913C17.8685 15.4858 17.4724 15.333 17.0002 15.333C16.5279 15.333 16.1324 15.4925 15.8135 15.8113C15.4935 16.1313 15.3335 16.5275 15.3335 16.9997V23.708C15.3335 24.1802 15.4935 24.5691 15.8135 24.8747C16.1324 25.1802 16.5279 25.333 17.0002 25.333ZM17.0002 11.9997C17.4724 11.9997 17.8685 11.8397 18.1885 11.5197C18.5074 11.2008 18.6668 10.8052 18.6668 10.333C18.6668 9.86079 18.5074 9.46467 18.1885 9.14467C17.8685 8.82579 17.4724 8.66634 17.0002 8.66634C16.5279 8.66634 16.1324 8.82579 15.8135 9.14467C15.4935 9.46467 15.3335 9.86079 15.3335 10.333C15.3335 10.8052 15.4935 11.2008 15.8135 11.5197C16.1324 11.8397 16.5279 11.9997 17.0002 11.9997ZM17.0002 33.6663C14.6946 33.6663 12.5279 33.2286 10.5002 32.353C8.47239 31.4786 6.7085 30.2913 5.2085 28.7913C3.7085 27.2913 2.52127 25.5275 1.64683 23.4997C0.771274 21.4719 0.333496 19.3052 0.333496 16.9997C0.333496 14.6941 0.771274 12.5275 1.64683 10.4997C2.52127 8.4719 3.7085 6.70801 5.2085 5.20801C6.7085 3.70801 8.47239 2.52023 10.5002 1.64467C12.5279 0.77023 14.6946 0.333008 17.0002 0.333008C19.3057 0.333008 21.4724 0.77023 23.5002 1.64467C25.5279 2.52023 27.2918 3.70801 28.7918 5.20801C30.2918 6.70801 31.4791 8.4719 32.3535 10.4997C33.229 12.5275 33.6668 14.6941 33.6668 16.9997C33.6668 19.3052 33.229 21.4719 32.3535 23.4997C31.4791 25.5275 30.2918 27.2913 28.7918 28.7913C27.2918 30.2913 25.5279 31.4786 23.5002 32.353C21.4724 33.2286 19.3057 33.6663 17.0002 33.6663Z"
      />
    </svg>
  );
};

export default InfoIcon;
