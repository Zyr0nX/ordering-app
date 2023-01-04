import type { InputHTMLAttributes, ReactElement } from "react";
import React from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  Icon?: ReactElement;
  ref?: any;
}

const Textbox = React.forwardRef<HTMLButtonElement, InputProps>(
  (props, ref) => (
    <div className="flex w-full flex-row rounded-lg border-2 border-solid border-transparent bg-neutral-200 py-2.5 pl-3 active:border-black">
      <div className="w-full pl-4">
        <input
          placeholder={props.placeholder}
          type="text"
          className="m-0 w-full border-none bg-neutral-200 p-0 text-left text-base leading-6 outline-none"
          ref={ref}
        />
      </div>
    </div>
  )
);

Textbox.displayName = "a";

export default Textbox;
