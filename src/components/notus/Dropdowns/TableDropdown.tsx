import { Menu } from "@headlessui/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const NotificationDropdown = () => {
  const links = [
    { href: "#", label: "Edit" },
    { href: "#", label: "Delete" },
  ];

  const [style, setStyle] = useState<string>("");

  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        type="button"
        className="text-slate-500 py-1 px-3"
        ref={buttonRef}
      >
        <i className="fas fa-ellipsis-v"></i>
      </Menu.Button>
      <Menu.Items className="absolute -bottom-4 right-6 bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48">
        {links.map((link) => (
          <Menu.Item key={link.href}>
            <Link
              href={link.href}
              className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-slate-700"
            >
              {link.label}
            </Link>
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};

export default NotificationDropdown;
