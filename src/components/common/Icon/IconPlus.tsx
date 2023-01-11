import React from "react";
import type { IconProps } from "./IconProps";

const IconPlus: React.FC<IconProps> = ({ ...props }) => {
  return (
    <svg viewBox={props.viewBox} className={props.className}>
      <path d="M12 5C12.5523 5 13 5.44772 13 6V11L18 11C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13L13 13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13L6 13C5.44772 13 5 12.5523 5 12C5 11.4477 5.44771 11 6 11L11 11V6C11 5.44772 11.4477 5 12 5Z"></path>
    </svg>
  );
};

export default IconPlus;
