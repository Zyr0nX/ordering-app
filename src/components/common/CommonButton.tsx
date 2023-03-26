import React from "react";

interface CommonButtonProps
  extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  text: string;
  disabled?: boolean;
}

const CommonButton: React.FC<CommonButtonProps> = ({ ...props }) => {
  return (
    <button
      className={`flex w-full max-w-md items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white ${
        props.disabled ? "cursor-not-allowed bg-gray-200" : ""}`}
      {...props}
    >
      {props.text}
    </button>
  );
};

export default CommonButton;
