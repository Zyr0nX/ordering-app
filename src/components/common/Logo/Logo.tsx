import Link from "next/link";
import React from "react";

export interface LogoProps {
  name: string;
}

const Logo: React.FC<LogoProps> = ({ name }) => {
  return (
    <Link href="/" legacyBehavior>
      <div className="block w-auto select-none text-2xl font-bold">{name}</div>
    </Link>
  );
};

export default Logo;
