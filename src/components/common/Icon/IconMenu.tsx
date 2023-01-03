import React from "react";
import type { IconProps } from "./IconProps";

const IconMenu: React.FC<IconProps> = ({ ...props }) => {
  return (
    <svg
      viewBox="0 0 20 20"
      className={props.className}
      aria-hidden={props["aria-hidden"]}
      focusable={props.focusable}
    >
      <path d="M19.167 3.333H.833v2.5h18.334v-2.5zm0 5.834H.833v2.5h18.334v-2.5zM.833 15h18.334v2.5H.833V15z"></path>
    </svg>
  );
};

export default IconMenu;
