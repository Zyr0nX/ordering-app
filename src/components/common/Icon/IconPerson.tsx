import React from "react";
import type { IconProps } from "./IconProps";

const IconPerson: React.FC<IconProps> = ({ ...props }) => {
  return (
    <svg
      viewBox="0 0 26 26"
      className={props.className}
      aria-hidden={props["aria-hidden"]}
      focusable={props.focusable}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M18.958 7.042a5.958 5.958 0 11-11.916 0 5.958 5.958 0 0111.916 0zM3.25 21.667c0-3.575 2.925-6.5 6.5-6.5h6.5c3.575 0 6.5 2.925 6.5 6.5v3.25H3.25v-3.25z"
      ></path>
    </svg>
  );
};

export default IconPerson;
