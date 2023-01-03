import React from "react";
import Anchor from "../../common/Anchor";
import Backdrop from "../../common/Backdrop/Backdrop";

export interface SidebarProps {
  sidebar: boolean;
  toggleSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebar, toggleSidebar }) => {
  return (
    <Backdrop visible={sidebar} onClick={toggleSidebar}>
      <aside
        className={`box-border w-75 max-w-4/5 overflow-y-auto overflow-x-hidden bg-white p-6 shadow-[0px_0px_25px_rgba(0_0_0_0.1)] transition-all duration-400 ease-in-out ${
          sidebar ? "translate-x-0 opacity-100" : "-translate-x-75 opacity-0"
        }`}
      >
        {sidebar && (
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
        )}
      </aside>
    </Backdrop>
  );
};

export default Sidebar;
