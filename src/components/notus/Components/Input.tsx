import type { ReactElement } from "react";
import React from "react";

const Input: React.FC<React.HtmlHTMLAttributes<HTMLInputElement>> = ({
  placeholder,
}) => {
  return (
    <div className="mb-3 pt-0">
      <input
        type="text"
        placeholder={placeholder}
        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border border-blueGray-300 outline-none focus:outline-none focus:shadow-outline w-full"
      />
    </div>
  );
};

export default Input;
