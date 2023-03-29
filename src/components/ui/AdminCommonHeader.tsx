import BackArrowIcon from "../icons/BackArrowIcon";
import LogoutIcon from "../icons/LogoutIcon";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

const AdminCommonHeader = ({ title }: { title: string }) => {
  return (
    <div className="from-viparyasDarkBlue/80 to-viparyasTeal/80 flex items-center justify-between bg-gradient-to-r p-6 text-white">
      <Link href="/manage/admin">
        <BackArrowIcon className="h-8 w-8 fill-white" />
      </Link>
      <div>
        <p className="text-2xl font-bold">{title}</p>
      </div>
      <button onClick={() => void signOut()}>
        <LogoutIcon className="h-8 w-8 fill-white" />
      </button>
    </div>
  );
};

export default AdminCommonHeader;
