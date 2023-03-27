import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestAccountHome from "~/components/ui/GuestAccountHome";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";

const index = () => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Account" />
        <GuestAccountHome />
      </>
    </Guest>
  );
};

export default index;
