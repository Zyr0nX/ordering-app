import React from "react";
import type { IconProps } from "./IconProps";

const IconShoppingCart: React.FC<IconProps> = ({ ...props }) => {
  return (
    <svg
      width={props.width}
      height={props.height}
      fill={props.fill}
      viewBox={props.viewBox}
      xmlns={props.xmlns}
      aria-label={props["aria-label"]}
      role={props.role}
      focusable={props.focusable}
      aria-hidden={props["aria-hidden"]}
      className={props.className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.666 11.333h10.333l1.334-8h-11l-.267-2h-3.4v2h1.667l1.333 8zm1.333 3.334A1.333 1.333 0 105 12a1.333 1.333 0 000 2.667zm9.334-1.334a1.333 1.333 0 11-2.667 0 1.333 1.333 0 012.667 0z"
      ></path>
    </svg>
  );
};

export default IconShoppingCart;
