import { type FieldHookConfig, useField } from "formik";
import React from "react";

interface InputProps {
  label?: string;
}

const TextInput: React.FC<InputProps & FieldHookConfig<string>> = ({
  ...props
}) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input>. We can use field meta to show an error
  // message if the field is invalid and it has been touched (i.e. visited)
  const [field, meta] = useField(props);
  return (
    <div className="flex items-center justify-between">
      {props.label && (
        <label htmlFor={props.id || props.name} className="font-medium">
          {props.label}
        </label>
      )}
      <input
        className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
        placeholder={props.placeholder}
        type={props.type}
        {...field}
      />
      {meta.touched && meta.error ? (
        <p className="text-virparyasRed text-xs">{meta.error}</p>
      ) : null}
    </div>
  );
};

export default TextInput;
