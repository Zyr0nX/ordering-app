import React, { forwardRef, type HtmlHTMLAttributes } from "react";

interface CommonInputProps extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  disabled?: boolean;
}

const CommonInput = forwardRef<HTMLInputElement, CommonInputProps>(
  (props, ref) => {
    return (
      <div className="flex flex-col">
        <label htmlFor={props.id} className="font-medium">
          {props.label}
        </label>
        <input
          type="text"
          className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 shadow-sm focus-visible:outline-none focus-visible:ring-2"
          ref={ref}
          disabled={props.disabled}
          {...props}
        />
      </div>
    );
  }
);

CommonInput.displayName = "CommonInput";

export default CommonInput;
