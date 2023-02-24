import { type NextPage } from "next";
import Head from "next/head";
import { type Restaurant } from "prisma/prisma-client";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";

import CategoryBar from "../components/common/Category/CategoryBar";
import ProductCard from "../components/common/Product/ProductCard";
import Header from "../components/ui/Header/Header";

const Home: NextPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const getAllRestaurantsQuery = api.restaurant.getAll.useQuery();
  useEffect(() => {
    console.log(getAllRestaurantsQuery.data);
    if (getAllRestaurantsQuery.status === "success") {
      setRestaurants(getAllRestaurantsQuery.data);
    }
  }, [getAllRestaurantsQuery.data, getAllRestaurantsQuery.status]);
  return (
    <>
      <Head>
        <title>Viparyas | Home</title>
        <meta name="description" content="Vyparyas | Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-full">
        <div className="relative flex h-full min-w-full flex-col">
          <Header />
        </div>
        <CategoryBar />
        <div className="grid grid-cols-4 gap-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id}>
              <ProductCard data={restaurant} />
            </div>
          ))}
        </div>
        {/* <IndexDropdown />
        <NotificationDropdown /> */}
      </div>
    </>
  );
};

export default Home;
