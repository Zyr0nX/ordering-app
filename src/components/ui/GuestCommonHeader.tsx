import AccountIcon from "../icons/AccountIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import { signOut } from "next-auth/react";
import React from "react";

const AdminCommonHeader = () => {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80 p-6 text-white">
      <button onClick={() => void signOut()}>
        <BackArrowIcon className="h-6 w-6 fill-white" />
      </button>
      <div>
        <p className="text-center text-2xl font-bold">
          Restaurants Registration
        </p>
      </div>
      <button>
        <AccountIcon />
      </button>
    </div>
  );
};

export default AdminCommonHeader;
