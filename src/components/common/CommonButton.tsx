import React from "react";

interface CommonButtonProps
  extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  text: string;
}

const CommonButton: React.FC<CommonButtonProps> = ({ ...props }) => {
  return (
    <button
      className="flex w-full items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white max-w-md"
      {...props}
    >
      {props.text}
    </button>
  );
};

export default CommonButton;
