import type { LinkProps } from "next/link";
import Link from "next/link";
import type { ReactElement } from "react";
import React from "react";

export interface AnchorProps extends LinkProps {
  backgroundColor?: "gray" | "black";
  Icon?: ReactElement;
  name?: string;
  variant?: "small" | "large";
}

const Anchor: React.FC<AnchorProps> = ({
  backgroundColor = "gray",
  Icon,
  href,
  name,
  variant = "small",
}) => {
  switch (variant) {
    case "small":
      return (
        <Link
          className={`box-border flex h-9 w-fit items-center whitespace-nowrap rounded-full px-3 py-3 text-sm font-medium leading-4 no-underline ${
            backgroundColor === "black"
              ? "bg-black text-white hover:bg-neutral-600 active:bg-neutral-500"
              : ""
          }${
            backgroundColor === "gray"
              ? "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400"
              : ""
          }`}
          href={href}
        >
          {Icon}
          {Icon && <div className="m-0 h-px w-1 shrink-0 p-0"></div>}
          {name}
        </Link>
      );
    case "large":
      return (
        <Link
          className={`flex min-h-[3.5rem] w-auto items-center justify-center whitespace-nowrap rounded-lg px-4 py-3 text-lg font-medium leading-4 ${
            backgroundColor === "black"
              ? "bg-black text-white hover:bg-neutral-800 active:bg-neutral-700"
              : ""
          }${
            backgroundColor === "gray"
              ? "bg-neutral-200 text-black hover:bg-neutral-300 active:bg-neutral-400"
              : ""
          }`}
          href={href}
        >
          {Icon}
          <div className={`${Icon ? "ml-1" : ""}`}>{name}</div>
        </Link>
      );

    default:
      return <></>;
  }
};

export default Anchor;
