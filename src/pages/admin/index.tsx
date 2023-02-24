import { type NextPage } from "next";
import React from "react";
import Admin from "~/components/layouts/Admin";
import AdminBody from "~/components/ui/AdminBody";
import AdminHeader from "~/components/ui/AdminHeader";

const index: NextPage = () => {
  return (
    <Admin>
      <>
        <div className="">
          <AdminHeader />
        </div>
        <div className="relative -top-8 mx-4 md:mx-20 md:-top-16">
          <AdminBody />
        </div>
      </>
    </Admin>
  );
};

export default index;
