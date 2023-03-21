import BackArrowIcon from "../icons/BackArrowIcon";
import LogoutIcon from "../icons/LogoutIcon";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

const ManageRestaurantHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasPurple/80 p-6 text-white">
      <button onClick={() => router.back}>
        <BackArrowIcon className="h-6 w-6 fill-white" />
      </button>
      <div>
        <p className="text-2xl font-bold">{title}</p>
      </div>
      <button onClick={() => void signOut()}>
        <LogoutIcon />
      </button>
    </div>
  );
};

export default ManageRestaurantHeader;
