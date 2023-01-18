import React from "react";

import type { IconProps } from "./IconProps";

const IconSearch: React.FC<IconProps> = ({ ...props }) => {
  return (
    <svg
      viewBox={props.viewBox}
      className={props.className}
      aria-hidden={props["aria-hidden"]}
      focusable={props.focusable}
    >
      <path d="M18.834 17l-3.666-3.667c.916-1.333 1.5-2.916 1.5-4.666C16.667 4.333 13.083.75 8.75.75 4.417.75.834 4.333.834 8.667c0 4.333 3.583 7.916 7.917 7.916 1.75 0 3.333-.583 4.666-1.5l3.667 3.667 1.75-1.75zm-15.5-8.25c0-3 2.417-5.417 5.417-5.417s5.416 2.417 5.416 5.417-2.416 5.417-5.416 5.417c-3 0-5.417-2.417-5.417-5.417z"></path>
    </svg>
  );
};

export default IconSearch;
