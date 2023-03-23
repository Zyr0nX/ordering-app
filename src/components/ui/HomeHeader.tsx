import AccountIcon from "../icons/AccountIcon";
import CartIcon from "../icons/CartIcon";
import HouseIcon from "../icons/HouseIcon";
import SearchIcon from "../icons/SearchIcon";
import Link from "next/link";
import React from "react";

const HomeHeader = () => {
  return (
    <div className="bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80 p-4 text-white md:p-8">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl bg-white/40 py-2 px-4">
          <HouseIcon className="md:h-6 md:w-6" />
          <p className="text-xs font-semibold text-virparyasMainBlue md:text-base md:font-bold">
            123 34th St
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin">
            <AccountIcon className="md:h-10 md:w-10" />
          </Link>
          <Link href="/cart">
            <CartIcon className="md:h-10 md:w-10" />
          </Link>
        </div>
      </div>
      <div>
        <p className="py-4 text-xl font-medium md:text-4xl">
          What are you craving for?
        </p>
        <div className="flex h-12 w-full items-center rounded-xl bg-white/40 md:w-96">
          <div className="p-3">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="h-full w-full bg-transparent placeholder:text-sm placeholder:font-light placeholder:text-white focus-within:outline-none"
            placeholder="Food, drinks, restaurants, ..."
          />
        </div>
      </div>
    </div>
  );
};

export default HomeHeader;
