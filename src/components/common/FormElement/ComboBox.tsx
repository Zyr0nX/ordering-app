import type { InputHTMLAttributes, ReactElement } from "react";
import React, { forwardRef, useState } from "react";
import IconArrowDropDown from "../Icon/IconArrowDropDown";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  Icon?: ReactElement;
}

const Textbox = (
  { Icon, placeholder }: InputProps,
  ref: React.Ref<HTMLInputElement>
) => {
  const [isExpand, setIsExpand] = useState<boolean>(false);
  return (
    <>
      <div
        className="flex w-full flex-row justify-between rounded-lg border-2 border-solid border-transparent bg-neutral-200 py-2.5 pl-3 active:border-black"
        onClick={() => {
          setIsExpand(!isExpand);
        }}
      >
        <div className="w-full grow px-4">
          <input
            placeholder={placeholder}
            type="text"
            className="m-0 w-full text-ellipsis border-none bg-neutral-200 p-0 text-left text-base leading-6 outline-none"
            ref={ref}
            autoComplete="off"
          />
        </div>
        <div className="flex items-center pr-3">
          <IconArrowDropDown viewBox="0 0 24 24" className="h-5 w-5" />
        </div>
        {isExpand && (
          <>
            <div className="absolute h-12 translate-y-full">aaaa</div>
            <div
              className="fixed top-0 left-0 h-full w-full"
              onClick={() => {
                setIsExpand(false);
              }}
            ></div>
          </>
        )}
      </div>
    </>
  );
};

export default forwardRef(Textbox);
