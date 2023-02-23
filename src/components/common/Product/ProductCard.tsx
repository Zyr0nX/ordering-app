import type { Restaurant } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductCard = ({ data }: { data: Restaurant }) => {
  return (
    <Link href={`/restaurant/${data.name}/${data.id}`} className="w-full my-6">
      <div className="h-32 overflow-hidden rounded-xl">
        <Image
          alt="a"
          src={data.brandImage as string}
          width={400}
          height={400}
          className="object-cover h-full hover:scale-110 transition-transform duration-100 ease-in-out"
        ></Image>
      </div>
      <div className="">
        <div className="mt-3 text-lg font-medium truncate">
          {data.name} ({data.address})
        </div>
        <div className="text-ellipsis">$2.49 Delivery Fee • 15-30 min</div>
      </div>
    </Link>
  );
};

export default ProductCard;
