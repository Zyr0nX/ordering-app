import CloudIcon from "../icons/CloudIcon";
import Loading from "./Loading";
import { useField } from "formik";
import Image from "next/image";
import React, {
  useState,
  type HtmlHTMLAttributes,
  useEffect,
  useRef,
} from "react";
import useBase64 from "~/utils/useBase64";

interface ImageUploadProps extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  name,
  id,
  ...props
}) => {
  const [field, meta, helpers] = useField<string>(name);
  const [file, setFile] = useState<File | null>(null);
  const { result: image, isLoading } = useBase64(file);
  const helpersRef = useRef(helpers);
  useEffect(() => {
    if (image) {
      helpersRef.current.setValue(image);
    }
  }, [image]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onChange, value, ...rest } = field;
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="truncate font-medium">
          {label}
        </label>
        {meta.touched && meta.error && (
          <p className="text-xs text-virparyasRed">{meta.error}</p>
        )}
      </div>

      <div
        className={`relative h-32 w-full overflow-hidden rounded-xl ${
          meta.touched && meta.error ? "ring-2 ring-virparyasRed" : ""
        }`}
      >
        {isLoading ? (
          <div className="relative flex h-32 items-center justify-center bg-black/60">
            <Loading className="h-12 w-12 animate-spin fill-virparyasMainBlue text-gray-200" />
          </div>
        ) : (
          <>
            <div className="absolute z-10 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60">
              <CloudIcon />
              <p className="font-medium text-white">{props.placeholder}</p>
            </div>
            {field.value && (
              <Image
                src={field.value}
                alt="Image"
                fill
                className="object-cover"
              ></Image>
            )}
            <input
              type="file"
              className="absolute top-0 z-10 h-full w-full cursor-pointer opacity-0"
              accept="image/*"
              onChange={(values) => {
                if (!values.target.files || !values.target.files[0]) return;
                setFile(values.target.files[0]);
              }}
              value={undefined}
              {...rest}
              {...props}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
