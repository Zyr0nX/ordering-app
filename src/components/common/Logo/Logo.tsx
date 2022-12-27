import Link from "next/link";
import React from "react";

export interface LogoProps {
  name: string;
}

const Button: React.FC<LogoProps> = ({ name }) => {
  return (
    <Link
      className="hidden select-none text-2xl font-semibold lg:block"
      href="/"
    >
      {name}
    </Link>
  );
};

export default Button;
