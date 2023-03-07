import AdminMainButton from "../common/AdminMainButton";
import CategoryIcon from "../icons/CategoryIcon";
import RequestIcon from "../icons/RequestIcon";
import RestaurantIcon from "../icons/RestaurantIcon";
import ShipperIcon from "../icons/ShipperIcon";
import UserIcon from "../icons/UserIcon";
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
          href="/admin/shippers"
        />
        <AdminMainButton
          text="Users"
          icon={<UserIcon className="md:h-24 md:w-24" />}
          href="/admin/users"
        />
        <AdminMainButton
          text="Requests"
          icon={<RequestIcon className="md:h-24 md:w-24" />}
          href="/admin/requests"
        />
        <AdminMainButton
          text="Categories"
          icon={<CategoryIcon className="md:h-24 md:w-24" />}
          href="/admin/categories"
        />
      </div>
    </>
  );
};

export default AdminBody;
