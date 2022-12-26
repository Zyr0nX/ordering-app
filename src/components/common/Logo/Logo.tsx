import React from "react";

export interface LogoProps {}

const Button: React.FC<LogoProps> = ({}) => {
  return (
    <a className="hidden select-none text-2xl font-semibold lg:block" href="/">
      Virparyas
    </a>
  );
};

export default Button;
