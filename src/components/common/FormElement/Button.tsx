import type { ButtonHTMLAttributes, ReactElement } from "react";
import Link from "next/link";
import React from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: "gray" | "black";
  Icon?: ReactElement;
  name?: string;
  onclick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  backgroundColor = "gray",
  Icon,
  name,
  type,
  onClick,
}) => {
  return (
    <button
      type={type}
      className={`m-0 flex min-h-12 w-full cursor-pointer items-center rounded-lg border-none px-4 py-3.5 text-base font-medium leading-5 shadow-none outline-none transition-[background] duration-200 ease-[cubic-bezier(0,0,1,1)] ${
        backgroundColor === "black"
          ? "bg-black text-white hover:bg-neutral-800 active:bg-neutral-700"
          : ""
      }${
        backgroundColor === "gray"
          ? "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex w-full items-center justify-between">
        <div></div>
        {Icon ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 flex items-center">{Icon}</div>
            <div className="flex items-center">
              <p
                className={`m-0 text-base font-medium leading-5 ${
                  backgroundColor === "black" ? "text-white" : ""
                }${backgroundColor === "gray" ? "text-black" : ""}`}
              >
                {name}
              </p>
            </div>
          </div>
        ) : (
          name
        )}
        <div></div>
      </div>
    </button>
  );
};

export default Button;
