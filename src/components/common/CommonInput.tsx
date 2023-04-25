import { useField } from "formik";
import React, { type HtmlHTMLAttributes } from "react";

interface CommonInputProps extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
}

const Input: React.FC<CommonInputProps> = ({ label, name, id, ...props }) => {
  const [field, meta] = useField<string>(name);
  const { onChange, ...rest } = field;
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
        onChange={(e) => {
          if (props.type === "number") {
            if (e.target.value === "") {
              field.onChange(e);
            } else {
              const parsed = Number(e.target.value);
              if (!isNaN(parsed)) {
                field.onChange(e);
              }
            }
          } else {
            field.onChange(e);
          }
        }}
        {...props}
        {...rest}
      />
    </div>
  );
};

export default Input;
