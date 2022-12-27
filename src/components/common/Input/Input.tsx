import type { InputHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  backgroundColor: "gray" | "black";
  placeholderColor?: "gray" | "black";
  Icon?: ReactElement;
}

const Button: React.FC<InputProps> = ({
  backgroundColor = "gray",
  Icon,
  type = "text",
  placeholder,
}) => {
  return (
    <div
      className={`flex h-12 w-full min-w-[40rem] max-w-[90rem] items-center rounded-full px-4 leading-5 transition-all duration-500 ease-in-out ${
        backgroundColor === "black"
          ? "bg-black text-white placeholder:text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700"
          : ""
      }${
        backgroundColor === "gray"
          ? "bg-neutral-200 text-black placeholder:text-neutral-600 hover:bg-neutral-300 active:bg-neutral-400"
          : ""
      }`}
    >
      {Icon}
      <div className={`${Icon ? "ml-4" : ""}`}></div>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full appearance-none overflow-hidden text-ellipsis bg-inherit outline-none ${
          backgroundColor === "black" ? "placeholder:text-neutral-400" : ""
        }${backgroundColor === "gray" ? "placeholder:text-neutral-700" : ""}`}
      />
    </div>
  );
};

export default Button;
