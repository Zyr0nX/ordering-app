import type { InputHTMLAttributes, ReactElement } from "react";
import React, { forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  Icon?: ReactElement;
}

const Textbox = (
  { Icon, placeholder }: InputProps,
  ref: React.Ref<HTMLInputElement>
) => {
  return (
    <div className="flex w-full flex-row rounded-lg border-2 border-solid border-transparent bg-neutral-200 py-2.5 pl-3 active:border-black" onClick={() => {
      ref.current.focus();
    }}>
      <div className="w-full px-4">
        <input
          placeholder={placeholder}
          type="text"
          className="m-0 w-full text-ellipsis border-none bg-neutral-200 p-0 text-left text-base leading-6 outline-none"
          ref={ref}
          autoComplete="off"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default forwardRef(Textbox);
