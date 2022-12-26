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
}) => {
  return (
    <a
      type={type}
      className={`flex h-9 w-fit items-center whitespace-nowrap rounded-full px-3 py-3 text-sm font-medium leading-4 ${
        backgroundColor === "black"
          ? "bg-black hover:bg-neutral-600 active:bg-neutral-500"
          : ""
      }${
        backgroundColor === "gray"
          ? "bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
          : ""
      } text-${textColor}`}
      href={href}
    >
      {Icon}
      <div className={`${Icon ? "ml-1" : ""}`}>{name}</div>
    </a>
  );
};

export default Button;
