import AdminCard from "../common/AdminCard";
import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import SearchIcon from "../icons/SearchIcon";
import React from "react";

const AdminRestaurantsBody = () => {
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 focus-visible:outline-none"
          placeholder="Search..."
        />
        <div className="flex w-16 items-center justify-center rounded-r-2xl bg-virparyasMainBlue">
          <SearchIcon />
        </div>
      </div>
      <div className="mt-8">
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
      </div>
    </div>
  );
};

export default AdminRestaurantsBody;
