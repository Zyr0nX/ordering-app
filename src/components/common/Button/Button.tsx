import type { ButtonHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: "gray" | "black";
  textColor?: "white" | "black";
  Icon?: ReactElement;
}

const Button: React.FC<ButtonProps> = ({
  backgroundColor = "black",
  textColor = "white",
  type = "button",
  disabled = false,
  Icon,
  name,
}) => {
  return (
    <button
      type={type}
      className={`flex h-9 items-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-4 text-${textColor} ${
        backgroundColor === "black"
          ? "bg-black hover:bg-neutral-600 active:bg-neutral-500"
          : ""
      }${
        backgroundColor === "gray"
          ? "bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400"
          : ""
      } `}
      disabled={disabled}
    >
      {Icon}
      <div className={`${Icon ? "ml-2" : ""}`}>{name}</div>
    </button>
  );
};

export default Button;
