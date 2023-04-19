import SearchIcon from "../icons/SearchIcon";
import React, { forwardRef, type HtmlHTMLAttributes } from "react";

const CommonSearch = forwardRef<
  HTMLInputElement,
  HtmlHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return (
    <div className="flex h-12 w-full overflow-hidden rounded-2xl">
      <input
        type="text"
        className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
        ref={ref}
        {...props}
      />
      <div className="flex items-center bg-virparyasMainBlue px-4">
        <SearchIcon />
      </div>
    </div>
  );
});

CommonSearch.displayName = "CommonSearch";

export default CommonSearch;
