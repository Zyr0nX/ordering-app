import Link, { LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface AnchorProps extends LinkProps {
  backgroundColor?: "gray" | "black";
  Icon?: ReactElement;
  name?: string;
}

const Button: React.FC<AnchorProps> = ({
  backgroundColor = "gray",
  Icon,
  href,
  name,
}) => {
  return (
    <Link
      className={`flex h-9 w-fit items-center whitespace-nowrap rounded-full px-3 py-3 text-sm font-medium leading-4 ${
        backgroundColor === "black"
          ? "bg-black text-white hover:bg-neutral-600 active:bg-neutral-500"
          : ""
      }${
        backgroundColor === "gray"
          ? "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400"
          : ""
      }`}
      href={href}
    >
      {Icon}
      <div className={`${Icon ? "ml-1" : ""}`}>{name}</div>
    </Link>
  );
};

export default Button;
