import AdminMainButton from "../common/AdminMainButton";
import RestaurantIcon from "../icons/RestaurantIcon";
import ShipperIcon from "../icons/ShipperIcon";
import React from "react";

const AdminBody = () => {
  return (
    <>
      <div className="mx-2 grid grid-cols-2 gap-4 md:mx-12">
        <AdminMainButton
          text="Restaurants"
          icon={<RestaurantIcon className="md:h-24 md:w-24" />}
          href="/admin/restaurants"
        />
        <AdminMainButton
          text="Shippers"
          icon={<ShipperIcon className="md:h-24 md:w-24" />}
          href="/admin/restaurants"
        />
        <AdminMainButton
          text="Shippers"
          icon={<ShipperIcon className="md:h-24 md:w-24" />}
          href="/admin/restaurants"
        />
        <AdminMainButton
          text="Shippers"
          icon={<ShipperIcon className="md:h-24 md:w-24" />}
          href="/admin/restaurants"
        />
        <AdminMainButton
          text="Shippers"
          icon={<ShipperIcon className="md:h-24 md:w-24" />}
          href="/admin/restaurants"
        />
        <AdminMainButton
          text="Shippers"
          icon={<ShipperIcon className="md:h-24 md:w-24" />}
          href="/admin/restaurants"
        />
      </div>
      {/* <div className="mt-8">
        <p className="my-2 text-virparyasMainBlue">Required Approval</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </div> */}
    </>
  );
};

export default AdminBody;
