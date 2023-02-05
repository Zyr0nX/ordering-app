// components
import type { ReactElement } from "react";
import React from "react";

import FooterAdmin from "../notus/Footers/FooterAdmin";
import HeaderStats from "../notus/Headers/HeaderStats";
import AdminNavbar from "../notus/Navbars/AdminNavbar";
import Sidebar from "../notus/Sidebar/Sidebar";

export default function Admin({ children }: { children: ReactElement }) {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-slate-100">
        <AdminNavbar />
        {/* Header */}
        <HeaderStats />
        <div className="px-4 md:px-10 mx-auto w-full -m-24">
          {children}
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
