import type { ReactElement, MouseEventHandler } from "react";
import React from "react";

export interface BackdropProps {
  children?: ReactElement;
  onClick?: MouseEventHandler<HTMLDivElement>;
  visible?: boolean;
}

const Backdrop: React.FC<BackdropProps> = ({ children, onClick, visible }) => {
  return (
    <div
      className={`fixed left-0 top-0 z-[6] flex overflow-y-hidden bg-neutral-800/80 ${
        visible
          ? "opacity-1 duration-400ms h-full w-full flex-row transition-opacity ease-[cubic-bezier(0.42,0,0.58,1)]"
          : "h-0 w-0 opacity-0 transition-[opacity,width,height] delay-[0s,400ms,400ms] duration-[400ms,0s,0s] ease-[cubic-bezier(0.42,0,0.58,1),cubic-bezier(0.25,0.1,0.25,1),cubic-bezier(0.25,0.1,0.25,1)]"
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Backdrop;
