import type { InputHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  Icon?: ReactElement;
}

const Textbox = ({ Icon, placeholder, value, onChange }: InputProps) => {
  return (
    <div className="flex w-full flex-row rounded-lg border-2 border-solid border-transparent bg-neutral-200  active:border-black">
      <div className="w-full px-4">
        <input
          placeholder={placeholder}
          type="text"
          className="m-0 h-full w-full text-ellipsis border-none bg-neutral-200 p-0 py-2.5 pl-3 text-left text-base leading-6 outline-none"
          value={value}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default Textbox;
