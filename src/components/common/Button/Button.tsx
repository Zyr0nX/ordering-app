import type { ButtonHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: "gray" | "black";
  Icon?: ReactElement;
  variant?: "normal" | "address";
}

const Button: React.FC<ButtonProps> = ({
  backgroundColor = "black",
  type = "button",
  disabled = false,
  Icon,
  name,
  variant = "normal",
}) => {
  switch (variant) {
    case "normal":
      return (
        <button
          type={type}
          className={`flex h-9 items-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-4 ${
            backgroundColor === "black"
              ? "bg-black text-white hover:bg-neutral-600 active:bg-neutral-500"
              : ""
          }${
            backgroundColor === "gray"
              ? "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400"
              : ""
          } `}
          disabled={disabled}
        >
          {Icon}
          <div className={`${Icon ? "ml-2" : ""}`}>{name}</div>
        </button>
      );
    case "address":
      return (
        <button
          type={type}
          className={`flex h-12 items-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium leading-4 ${
            backgroundColor === "black"
              ? "bg-black text-white hover:bg-neutral-600 active:bg-neutral-500"
              : ""
          }${
            backgroundColor === "gray"
              ? "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400"
              : ""
          }`}
          disabled={disabled}
        >
          {Icon}
          <div
            className={`text-ellipsis whitespace-nowrap ${Icon ? "ml-2" : ""}`}
          >
            {name}
          </div>
        </button>
      );
    default:
      console.error("Button variant: %s isn't valid", variant);
      return <></>;
  }
};

export default Button;
