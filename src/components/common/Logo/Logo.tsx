import React from "react";

export interface LogoProps {
}

const Button: React.FC<LogoProps> = ({
}) => {
  return (
    <a
      className="text-2xl font-semibold select-none"
      href="/"
    >
      Virparyas
    </a>
  );
};

export default Button;
