import React from "react";

import AdminCard from "../common/AdminCard";
import AdminMainButton from "../common/AdminMainButton";
import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import RestaurantIcon from "../icons/RestaurantIcon";
import ShipperIcon from "../icons/ShipperIcon";

const AdminBody = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mx-2 md:mx-12">
        <AdminMainButton
          text="Restaurants"
          icon={<RestaurantIcon className="md:h-24 md:w-24" />}
        />
        <AdminMainButton
          text="Shippers"
          icon={<ShipperIcon className="md:h-24 md:w-24" />}
        />
      </div>
      <div className="mt-8">
        <p className="text-virparyasMainBlue my-2">Required Approval</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard
            text="Sabrina’s Cafe"
            subtext="Restaurant"
            icon1={<GreenCheckmark className="md:h-10 md:w-10" />}
            icon2={<RedCross className="md:h-10 md:w-10" />}
          />
          <AdminCard
            text="John Doe"
            subtext="Shipper"
            icon1={<GreenCheckmark className="md:h-10 md:w-10" />}
            icon2={<RedCross className="md:h-10 md:w-10" />}
          />
          <AdminCard
            text="Jane Doe"
            subtext="Shipper"
            icon1={<GreenCheckmark className="md:h-10 md:w-10" />}
            icon2={<RedCross className="md:h-10 md:w-10" />}
          />
        </div>
      </div>
    </>
  );
};

export default AdminBody;
