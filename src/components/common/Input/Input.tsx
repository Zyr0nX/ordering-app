import type { InputHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface AnchorProps extends InputHTMLAttributes<HTMLButtonElement> {
  backgroundColor?: "gray" | "black";
  textColor?: "white" | "black";
  placeholderColor?: "gray" | "black";
  Icon?: ReactElement;
}

const Button: React.FC<AnchorProps> = ({
  backgroundColor = "gray",
  textColor = "black",
  placeholderColor = "gray",
  Icon,
  name,
  type = "text",
  placeholder,
}) => {
  return (
    <div
      className={`absolute flex h-12 w-96 min-w-[11rem] max-w-[65rem] items-center rounded-full px-4 leading-5 transition-all duration-500 ease-in-out ${
        backgroundColor === "black" ? "bg-black" : ""
      }${
        backgroundColor === "gray" ? "bg-gray-300" : ""
      } text-${textColor} w-fit`}
    >
      {Icon}
      <div className={`${Icon ? "ml-4" : ""}`}>
        <input
          type={type}
          placeholder={placeholder}
          className={`appearance-none overflow-hidden text-ellipsis outline-none ${
            backgroundColor === "black" ? "bg-black" : ""
          }${backgroundColor === "gray" ? "bg-gray-300" : ""}`}
        />
      </div>
    </div>
  );
};

export default Button;
