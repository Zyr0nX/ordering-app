import type { ReactElement, MouseEventHandler } from "react";
import React, { useState } from "react";
import { motion } from "framer-motion";

export interface BackdropProps {
  children?: ReactElement;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const Backdrop: React.FC<BackdropProps> = ({ children, onClick }) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div
      className={`opacity-1 fixed left-0 top-0 z-[6] flex h-full w-full flex-row overflow-y-hidden bg-neutral-800/80 transition-[opacity,width,height] duration-[400ms,0,0] ease-[cubic-bezier(0.42,0,0.58,1),cubic-bezier(0.25,0.1,0.25,1),cubic-bezier(0.25,0.1,0.25,1)] ${
        visible
          ? "opacity-1 duration-400ms transition-opacity ease-[cubic-bezier(0.42,0,0.58,1)]"
          : "opacity-0 transition-[opacity,width,height] duration-[400ms,0s,0s] ease-[cubic-bezier(0.42,0,0.58,1),cubic-bezier(0.25,0.1,0.25,1),cubic-bezier(0.25,0.1,0.25,1)]"
      }`}
      onClick={() => setVisible(true)}
    >
      {children}
    </div>
  );
};

export default Backdrop;
