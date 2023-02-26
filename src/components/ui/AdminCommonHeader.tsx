import BackArrowIcon from "../icons/BackArrowIcon";
import LogoutIcon from "../icons/LogoutIcon";
import { signOut } from "next-auth/react";
import React from "react";

const AdminCommonHeader = () => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-viparyasDarkBlue/80 to-viparyasTeal/80 p-6 text-white">
      <button onClick={() => void signOut()}>
        <BackArrowIcon className="h-6 w-6 fill-white" />
      </button>
      <div>
        <p className="text-2xl font-bold">Restaurants</p>
      </div>
      <button onClick={() => void signOut()}>
        <LogoutIcon />
      </button>
    </div>
  );
};

export default AdminCommonHeader;
