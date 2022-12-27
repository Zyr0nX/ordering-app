import React from "react";
import {
  MdLocationPin,
  MdMenu,
  MdSearch,
  MdShoppingCart,
  MdPerson,
} from "react-icons/md";
import Logo from "../../common/Logo";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Anchor from "../../common/Anchor";

const Header = () => {
  return (
    <div className="relative flex h-24 min-w-[65rem] max-w-[120rem] items-center px-10">
      <MdMenu className="shrink-0 cursor-pointer" size="1.5rem" />
      <div className="w-2 md:w-6"></div>
      <Logo name="Virparyas" />
      <div className="w-2 md:w-6"></div>
      <Button
        backgroundColor="gray"
        Icon={<MdLocationPin size="1rem" />}
        name="Nam Tu Liem · Now"
      />
      <div className="w-2 md:w-6"></div>

      <Input
        backgroundColor="gray"
        placeholder="Food, groceries, drinks, etc"
        Icon={<MdSearch size="1rem" />}
      />
      <div className="w-3"></div>

      <div className="ml-auto flex grow-0 items-center justify-end">
        <div className="max-w-[19rem]">
          <Button
            backgroundColor="black"
            Icon={<MdShoppingCart size="1rem" />}
            name="Cart · 0"
          />
        </div>
        <div className="w-3"></div>
        <Anchor
          backgroundColor="gray"
          Icon={<MdPerson size="1rem" />}
          href="/login"
          name="Log in"
        />
        <div className="w-3"></div>
        <Anchor backgroundColor="gray" href="/signin" name="Sign up" />
      </div>
    </div>
  );
};

export default Header;
