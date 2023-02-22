import Image from "next/image";
import { useRouter } from "next/router";
import type { Food, Restaurant } from "prisma/prisma-client";
import React, { useEffect, useState } from "react";

import { trpc } from "../../utils/trpc";

const RestaurantDetail = () => {
  const router = useRouter();

  const { slug } = router.query;
  useEffect(() => {
    if (slug) {
      setRestaurantId(slug[1]);
    }
  }, [slug]);

  const [restaurantData, setRestaurantData] = useState<
    (Restaurant & { food: Food[] }) | null | undefined
  >();
  const [restaurantId, setRestaurantId] = useState<string>();
  const restaurantQuery = trpc.restaurant.get.useQuery(
    { id: restaurantId as string },
    { enabled: restaurantId !== undefined }
  );
  useEffect(() => {
    if (restaurantId) {
      setRestaurantData(restaurantQuery.data);
    }
  }, [restaurantId, restaurantQuery.data]);
  if (!restaurantData) {
    return <div>Loading...</div>;
  }
  console.log(restaurantData);
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="min-w-[1024px] max-h-[1920px] h-40 w-full">
        <Image
          src={restaurantData.brandImage as string}
          alt="Brand Image"
          width={1024}
          height={160}
          priority
        ></Image>
      </div>
    </div>
  );
};

export default RestaurantDetail;
