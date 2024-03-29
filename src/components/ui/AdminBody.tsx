import MainButton from "../common/MainButton";
import CategoryIcon from "../icons/CategoryIcon";
import RequestIcon from "../icons/RequestIcon";
import RestaurantIcon from "../icons/RestaurantIcon";
import ShipperIcon from "../icons/ShipperIcon";
import UserIcon from "../icons/UserIcon";
import React from "react";

const AdminBody = () => {
  return (
    <div className="mx-2 grid grid-cols-2 gap-4 md:mx-12">
      <MainButton
        text="Restaurants"
        icon={<RestaurantIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/restaurants"
      />
      <MainButton
        text="Shippers"
        icon={<ShipperIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/shippers"
      />
      <MainButton
        text="Users"
        icon={<UserIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/users"
      />
      <MainButton
        text="Requests"
        icon={<RequestIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/requests"
      />
      <MainButton
        text="Cuisines"
        icon={<CategoryIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/cuisines"
      />
    </div>
  );
};

export default AdminBody;
