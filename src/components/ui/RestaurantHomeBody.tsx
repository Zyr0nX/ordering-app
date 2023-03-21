import AdminMainButton from "../common/AdminMainButton";
import BookIcon from "../icons/BookIcon";
import CancelOrderIcon from "../icons/CancelOrderIcon";
import CompleteIcon from "../icons/CompleteIcon";
import InProgressIcon from "../icons/InProgressIcon";
import PullRequestIcon from "../icons/PullRequestIcon";
import SettingsIcon from "../icons/SettingsIcon";
import React from "react";

const RestaurantHomeBody = () => {
  return (
    <>
      <div className="mx-2 grid grid-cols-2 gap-4 md:mx-12">
        <AdminMainButton
          text="Order Requests"
          icon={<PullRequestIcon className="md:h-24 md:w-24" />}
          href="/manage/restaurant/requests"
        />
        <AdminMainButton
          text="In-progress Orders"
          icon={<InProgressIcon className="md:h-24 md:w-24" />}
          href="/admin/shippers"
        />
        <AdminMainButton
          text="Completed Orders"
          icon={<CompleteIcon className="md:h-24 md:w-24" />}
          href="/admin/users"
        />
        <AdminMainButton
          text="Cancelled Orders"
          icon={<CancelOrderIcon className="md:h-24 md:w-24" />}
          href="/admin/requests"
        />
        <AdminMainButton
          text="Edit Menu"
          icon={<BookIcon className="md:h-24 md:w-24" />}
          href="/admin/requests"
        />
        <AdminMainButton
          text="Settings"
          icon={<SettingsIcon className="md:h-24 md:w-24" />}
          href="/admin/categories"
        />
      </div>
    </>
  );
};

export default RestaurantHomeBody;
