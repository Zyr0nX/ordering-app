import CloudIcon from "../icons/CloudIcon";
import { useField } from "formik";
import Image from "next/image";
import React, { type HtmlHTMLAttributes } from "react";

interface ImageUploadProps extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, name, id, ...props }) => {
  const [field, meta] = useField<string>(name);
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="truncate font-medium">
          {label}
        </label>
        {meta.touched && meta.error && (
          <p className="text-xs text-virparyasRed">Image is required</p>
        )}
      </div>

      <div
        className={`relative h-[125px] w-full overflow-hidden rounded-xl ${
          meta.touched && meta.error ? "ring-2 ring-virparyasRed" : ""
        }`}
      >
        <div className="absolute top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60">
          <CloudIcon />
          <p className="font-medium text-white">{props.placeholder}</p>
        </div>
        <input
          type="file"
          className="absolute top-0 z-10 h-full w-full cursor-pointer opacity-0"
          accept="image/*"
          {...props}
        />
        {field.value && (
          <Image
            src={field.value}
            alt="Image"
            fill
            className="object-cover"
          ></Image>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
