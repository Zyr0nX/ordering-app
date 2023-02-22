import Image from "next/image";
import Link from "next/link";
import React from "react";

import a from "../../../../public/a.webp";

const ProductCard = () => {
  return (
    <Link href="" className="w-full my-6">
      <div className="h-32 overflow-hidden rounded-xl">
        <Image
          alt="a"
          src={a}
          className="object-cover h-full hover:scale-110 transition-transform duration-100 ease-in-out"
        ></Image>
      </div>
      <div className="">
        <div className="mt-3 text-lg font-medium truncate">
          Wawa 8141 (3300 Market St.) kjhbasdjkfhkajsdhfhalksjhfdjkasdhkjfhsa
        </div>
        <div className="text-ellipsis">$2.49 Delivery Fee • 15-30 min</div>
      </div>
    </Link>
  );
};

export default ProductCard;
