import React from "react";

import type { IconProps } from "./IconProps";

const IconArrowDropDown: React.FC<IconProps> = ({ ...props }) => {
  return (
    <svg viewBox={props.viewBox} className={props.className}>
      <path d="M12.7071 15.2929L17.1464 10.8536C17.4614 10.5386 17.2383 10 16.7929 10L7.20711 10C6.76165 10 6.53857 10.5386 6.85355 10.8536L11.2929 15.2929C11.6834 15.6834 12.3166 15.6834 12.7071 15.2929Z"></path>
    </svg>
  );
};

export default IconArrowDropDown;
