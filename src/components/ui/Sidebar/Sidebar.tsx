import React from "react";
import Anchor from "../../common/Anchor";

const Sidebar = () => {
  return (
    <aside className="box-border w-[18.75rem] max-w-[80%] overflow-y-auto overflow-x-hidden p-6 shadow-xl transition-all duration-500 ease-in-out">
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
    </aside>
  );
};

export default Sidebar;
