import type { ReactElement, MouseEventHandler } from "react";
import React from "react";
import { motion } from "framer-motion";

export interface BackdropProps {
  children?: ReactElement;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const Backdrop: React.FC<BackdropProps> = ({ children, onClick }) => {
  return (
    <motion.div
      className="fixed left-0 top-0 z-50 h-screen w-screen bg-neutral-800/80"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export default Backdrop;
