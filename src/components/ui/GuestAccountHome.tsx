import MainButton from "../common/MainButton";
import AccountIcon from "../icons/AccountIcon";
import CartIcon from "../icons/CartIcon";
import LogoutIcon from "../icons/LogoutIcon";
import OrderIcon from "../icons/OrderIcon";
import { signOut } from "next-auth/react";
import React from "react";

const GuestAccountHome = () => {
  return (
    <div className="m-4 grid grid-cols-2 gap-4 md:m-8">
      <MainButton
        text="Account Information"
        icon={
          <AccountIcon className="h-16 w-16 fill-virparyasMainBlue md:h-24 md:w-24" />
        }
        href="/account/information"
      />
      <MainButton
        text="Cart"
        icon={
          <CartIcon className="h-16 w-16 fill-virparyasMainBlue md:h-24 md:w-24" />
        }
        href="/cart"
      />
      <MainButton
        text="Order History"
        icon={<OrderIcon className="md:h-24 md:w-24" />}
        href="/orders/history"
      />
      <button
        className="flex h-40 flex-col items-center justify-center gap-2 rounded-2xl bg-white shadow-[0_4px_5px_0_rgba(0,0,0,0.1)] md:flex-row md:gap-8"
        onClick={() => void signOut()}
      >
        <div>
          <LogoutIcon className="h-16 w-16 fill-virparyasMainBlue md:h-24 md:w-24" />
        </div>
        <p className="text-center text-xl font-medium text-virparyasMainBlue md:text-4xl">
          Log out
        </p>
      </button>
    </div>
  );
};

export default GuestAccountHome;
