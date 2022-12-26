import type { AnchorHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface AnchorProps extends AnchorHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: "gray" | "black";
  textColor?: "gray" | "black";
  Icon?: ReactElement;
  name?: string;
}

const Button: React.FC<AnchorProps> = ({
  backgroundColor = "gray",
  textColor = "black",
  type = "text/html",
  Icon,
  href,
  name,
  ...rest
}) => {
  return (
    <a
      type={type}
      className={`flex h-9 items-center whitespace-nowrap rounded-full px-3 py-3 text-sm font-medium leading-4 ${
        backgroundColor === "black" ? "bg-black" : ""
      }${
        backgroundColor === "gray" ? "bg-gray-300" : ""
      } text-${textColor} w-fit`}
      href={href}
    >
      {Icon}
      <div className={`${Icon ? "ml-1" : ""}`}>{name}</div>
    </a>
  );
};

export default Button;
