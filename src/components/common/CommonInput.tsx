import { useField } from "formik";
import React, { type HtmlHTMLAttributes } from "react";

interface CommonInputProps extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number";
}

const Input: React.FC<CommonInputProps> = ({
  label,
  name,
  id,
  ...props
}) => {
  const [field, meta] = useField<string>(name);
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {meta.touched && meta.error && (
          <p className="text-xs text-virparyasRed">{meta.error}</p>
        )}
      </div>

      <input
        className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
          meta.touched && meta.error ? "ring-2 ring-virparyasRed" : ""
        }`}
        id={id}
        {...props}
        {...field}
      />
    </div>
  );
};

export default Input;
