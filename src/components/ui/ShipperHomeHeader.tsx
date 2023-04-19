import LogoutIcon from "../icons/LogoutIcon";
import { signOut } from "next-auth/react";
import React from "react";

const ShipperHomeHeader: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightRed/80 pb-24 pt-16 text-white md:pb-32 md:pt-8">
      <button
        className="absolute right-0 top-0 p-5"
        onClick={() => void signOut()}
      >
        <LogoutIcon />
      </button>
      <div>
        <p className="mb-5 text-center text-xl md:text-2xl">
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

export default ShipperHomeHeader;
