import MainButton from "../common/MainButton";
import CompleteIcon from "../icons/CompleteIcon";
import InProgressIcon from "../icons/InProgressIcon";
import SettingsIcon from "../icons/SettingsIcon";
import React from "react";

const ShipperHomeBody = () => {
  return (
    <>
      <div className="mx-2 grid grid-cols-2 gap-4 md:mx-12">
        <MainButton
          text="In-progress Orders"
          icon={<InProgressIcon className="md:h-24 md:w-24" />}
          href="/manage/shipper/in-progress"
        />
        <MainButton
          text="Completed Orders"
          icon={<CompleteIcon className="md:h-24 md:w-24" />}
          href="/manage/shipper/history"
        />
        <MainButton
          text="Profile"
          icon={<SettingsIcon className="md:h-24 md:w-24" />}
          href="/manage/shipper/profile"
        />
      </div>
    </>
  );
};

export default ShipperHomeBody;
