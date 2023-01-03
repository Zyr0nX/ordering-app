import React, { useState } from "react";
import Logo from "../../common/Logo";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Anchor from "../../common/Anchor";
import Sidebar from "../Sidebar";
import IconMenu from "../../common/Icon/IconMenu";
import IconLocationPin from "../../common/Icon/IconLocationPin";
import IconShoppingCart from "../../common/Icon/IconShoppingCart";
import IconSearch from "../../common/Icon/IconSearch";
import IconPerson from "../../common/Icon/IconPerson";

const Header = () => {
  const [sidebar, setSidebar] = useState<boolean>(false);

  return (
    <>
      {sidebar && <Sidebar setSidebar={setSidebar} sidebar={false} />}
      <header>
        <div className="mx-auto my-0 w-full bg-white">
          <div className="relative my-0 mx-auto box-border flex h-24 min-w-[64rem] max-w-[120rem] flex-row items-center py-0 px-10 text-black">
            <button
              aria-label="Main navigation menu"
              className="flex h-6 w-6 cursor-pointer items-center"
            >
              <IconMenu
                aria-hidden="true"
                focusable="false"
                className="h-5 w-5 shrink-0 grow-0 basis-auto cursor-pointer fill-current"
                onClick={() => {
                  setSidebar(true);
                }}
              />
            </button>

            <div className="m-0 h-px w-8 shrink-0 p-0"></div>
            <Logo name="Virparyas" />
            <div className="m-0 h-px w-10 shrink-0 p-0"></div>
            <div className="m-0 h-px w-4 shrink-0 p-0"></div>
            <span>
              <Button
                variant="address"
                backgroundColor="gray"
                Icon={
                  <IconLocationPin
                    width="1rem"
                    height="1.5rem"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Deliver to"
                    role="img"
                    focusable="false"
                  />
                }
                name="Nam Tu Liem  ·  Now"
              />
            </span>
            <div className="m-0 h-px w-12 shrink-0 p-0"></div>
            <div className="flex w-full grow">
              <div className="mx-auto my-0 w-full bg-white">
                <div className="relative">
                  <Input
                    backgroundColor="gray"
                    placeholder="Food, groceries, drinks, etc"
                    Icon={
                      <IconSearch
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 20 20"
                        className="h-4 w-4 flex-none fill-current"
                      />
                    }
                  />
                </div>
              </div>
            </div>

            <div className="m-0 h-px w-6 shrink-0 p-0"></div>

            <div className="flex grow-0 items-center justify-end">
              <div className="relative flex max-w-75 overflow-hidden opacity-100 transition-max-width-opacity duration-100 ease-normal">
                <div className="m-0 h-px w-6 shrink-0 p-0"></div>
                <Button
                  backgroundColor="black"
                  Icon={
                    <IconShoppingCart
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 16 16"
                      className="h-4 w-4 flex-none fill-current"
                    />
                  }
                  name="Cart · 0"
                />
              </div>
              <div className="w-6"></div>
              <Anchor
                backgroundColor="gray"
                Icon={
                  <IconPerson
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 26 26"
                    className="h-4 w-4 flex-none fill-current"
                  />
                }
                href="/login"
                name="Log in"
              />
              <div className="w-4"></div>
              <Anchor backgroundColor="gray" href="/signin" name="Sign up" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
