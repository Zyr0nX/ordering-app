import React from "react";
import { motion } from "framer-motion";
import Anchor from "../../common/Anchor";
import Backdrop from "../../common/Backdrop/Backdrop";

export interface SidebarProps {
  sidebar: boolean;
  setSideBar: unknown;
}

const Sidebar: React.FC<SidebarProps> = (sidebar, setSideBar) => {
  console.log(setSideBar)
  const onBackdropClick = (sidebar: boolean) => {
    setSideBar(sidebar);
  };

  return (
    <Backdrop onClick={() => onBackdropClick(sidebar)}>
      <motion.aside
        className="box-border w-[18.75rem] max-w-[80%] overflow-y-auto overflow-x-hidden bg-white p-6 shadow-xl transition-all duration-500 ease-in-out"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          transition: { duration: 0.5, damping: 25, stiffness: 500 },
        }}
        exit={{ x: "-100%", opacity: 0 }}
      >
        <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between">
          <div>
            <Anchor
              backgroundColor="black"
              name="Sign Up"
              variant="large"
              href="./signin"
            />
            <div className="h-2"></div>
            <Anchor
              backgroundColor="gray"
              name="Log In"
              variant="large"
              href="./login"
            />
          </div>
        </div>
      </motion.aside>
    </Backdrop>
  );
};

export default Sidebar;
