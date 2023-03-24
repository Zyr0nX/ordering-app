import AccountIcon from "../icons/AccountIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import { useRouter } from "next/router";
import React from "react";

const GuestCommonHeader = ({ text }: { text: string }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80 p-4 md:p-6 text-white">
      <button onClick={() => router.back()}>
        <BackArrowIcon className="md:h-10 md:w-10 fill-white" />
      </button>
      <div>
        <p className="text-center text-2xl font-bold">{text}</p>
      </div>
      <button>
        <AccountIcon className="md:h-10 md:w-10"/>
      </button>
    </div>
  );
};

export default GuestCommonHeader;
