import AccountIcon from "../icons/AccountIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import { useRouter } from "next/router";
import React from "react";

const GuestCommonHeader = () => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80 p-6 text-white">
      <button onClick={() => router.back()}>
        <BackArrowIcon className="h-6 w-6 fill-white" />
      </button>
      <div>
        <p className="text-center text-2xl font-bold">Cart</p>
      </div>
      <button>
        <AccountIcon />
      </button>
    </div>
  );
};

export default GuestCommonHeader;
