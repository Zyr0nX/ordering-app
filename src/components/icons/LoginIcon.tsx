import React, { type HtmlHTMLAttributes } from "react";

const LoginIcon: React.FC<HtmlHTMLAttributes<HTMLOrSVGElement>> = ({
  ...props
}) => {
  return (
    <svg viewBox="0 0 48 41" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21.5978 29.2418L33.5966 20.245L21.5978 11.2483V17.9959H0V22.4942H21.5978V29.2418Z" />
      <path d="M26.3998 7.72846e-05C23.5621 -0.00729712 20.7511 0.513141 18.1296 1.53124C15.5081 2.54934 13.1281 4.04487 11.1277 5.93118L14.5209 9.11153C17.6934 6.13811 21.9122 4.49845 26.3998 4.49845C30.8873 4.49845 35.1061 6.13811 38.2786 9.11153C41.4511 12.085 43.2005 16.039 43.2005 20.245C43.2005 24.451 41.4511 28.4051 38.2786 31.3785C35.1061 34.3519 30.8873 35.9916 26.3998 35.9916C21.9122 35.9916 17.6934 34.3519 14.5209 31.3785L11.1277 34.5588C15.2049 38.3825 20.6283 40.4899 26.3998 40.4899C32.1712 40.4899 37.5946 38.3825 41.6718 34.5588C45.7514 30.7375 48 25.6543 48 20.245C48 14.8357 45.7514 9.75255 41.6718 5.93118C39.6714 4.04487 37.2915 2.54934 34.6699 1.53124C32.0484 0.513141 29.2374 -0.00729712 26.3998 7.72846e-05Z" />
    </svg>
  );
};

export default LoginIcon;