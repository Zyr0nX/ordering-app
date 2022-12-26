import type { ButtonHTMLAttributes, ReactElement } from "react";
import type { IconType } from "react-icons";
import React from "react";
import type {  } from "next";


export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: "white" | "black";
  textColor?: "white" | "black";
  width?: string | number;
  variant?: "flat" | "slim" | "ghost" | "naked";
  Icon?: ReactElement;
}

const Button: React.FC<ButtonProps> = ({
  backgroundColor = "black",
  textColor = "white",
  type,
  width,
  disabled = false,
  variant,
  Icon,
  name,
}) => {
  return (
    <button
      type={type}
      className={`align-center flex h-9 rounded-full px-3 py-2 text-sm font-medium ${backgroundColor === "black" ? "bg-black" : ""}${backgroundColor === "white" ? "bg-white" : ""} text-${textColor} w-${
        width ? `[${width}]` : "auto"
      }`}
      disabled={disabled}
    >
      {Icon}
      <div className={`whitespace-nowrap ${Icon ? "ml-2" : ""}`}>{name}</div>
    </button>
  );
};

export default Button;
