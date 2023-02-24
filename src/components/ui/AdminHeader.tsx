import React from "react";

import LogoutIcon from "../icons/LogoutIcon";

const AdminHeader: React.FC = () => {
  return (
    <div className="pt-16 md:pt-8 pb-24 md:pb-32 text-white relative bg-gradient-to-r from-viparyasDarkBlue/80 to-viparyasTeal/80 flex justify-center items-center">
      <div className="absolute right-5 top-5">
        <LogoutIcon />
      </div>
      <div>
        <p className="text-xl text-center mb-5 md:text-2xl">
          Today&apos;s stats
        </p>
        <div className="flex">
          <div className="w-[50vw] text-center">
            <p className="text-5xl font-bold md:text-8xl">2500</p>
            <p className="font-thin md:text-4xl">Completed Order</p>
          </div>
          <div className="w-[50vw] text-center">
            <p className="text-5xl font-bold md:text-8xl">$50k</p>
            <p className="font-thin md:text-4xl">Total Income</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
