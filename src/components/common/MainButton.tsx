import Link from "next/link";
import React from "react";

interface AdminMainButtonProps {
  text: string;
  icon: React.ReactNode;
  href: string;
}

const MainButton: React.FC<AdminMainButtonProps> = ({ text, icon, href }) => {
  return (
    <Link
      href={href}
      className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-white shadow-[0_4px_5px_0_rgba(0,0,0,0.1)] md:flex-row md:gap-8"
    >
      <div>{icon}</div>

      <p className="text-center text-xl font-medium text-virparyasMainBlue md:text-4xl">
        {text}
      </p>
    </Link>
  );
};

export default MainButton;
