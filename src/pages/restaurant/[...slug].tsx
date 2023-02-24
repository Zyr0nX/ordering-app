import FoodCard from "../../components/common/FoodCard/FoodCard";
import Header from "../../components/ui/Header";
import { trpc } from "../../utils/api";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import type { Food, Restaurant } from "prisma/prisma-client";
import React, { useEffect, useState } from "react";

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
  trpc.restaurant.get.useQuery(
    { id: restaurantId as string },
    {
      enabled: restaurantId !== undefined,
      onSuccess: (data) => {
        setRestaurantData(data);
      },
    }
  );
  if (!restaurantData) {
    return <div>Loading...</div>;
  }
  console.log(restaurantData);
  return (
    <>
      <Head>
        <title>Viparyas | {restaurantData.name}</title>
        <meta name="description" content="Vyparyas | Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative flex h-full min-w-full flex-col">
        <Header />
      </div>
      <div className="min-w-[1024px] max-h-[1920px] h-40">
        <Image
          src={restaurantData.brandImage as string}
          alt="Brand Image"
          width={1024}
          height={160}
          className="object-cover h-full w-full"
        ></Image>
      </div>
      <div className="m-10">
        <h1 className="font-bold text-4xl">
          {restaurantData.name} ({restaurantData.address})
        </h1>
        {restaurantData.food.map((food) => (
          <div className="grid grid-cols-4" key={food.id}>
            <FoodCard data={food} />
          </div>
        ))}
      </div>
    </>
  );
};

export default RestaurantDetail;
