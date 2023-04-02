import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { type inferProcedureOutput } from "@trpc/server";
import fuzzysort from "fuzzysort";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { type InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import superjson from "superjson";
import { create } from "zustand";
import Loading from "~/components/common/Loading";
import RestaurantFavoriteCard from "~/components/common/RestaurantFavoriteCard";
import AccountIcon from "~/components/icons/AccountIcon";
import CartIcon from "~/components/icons/CartIcon";
import HeartIcon from "~/components/icons/HeartIcon";
import HouseIcon from "~/components/icons/HouseIcon";
import LoginIcon from "~/components/icons/LoginIcon";
import SearchIcon from "~/components/icons/SearchIcon";
import SleepIcon from "~/components/icons/SleepIcon";
import Guest from "~/components/layouts/Guest";
import { AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { useHomeStore } from "~/stores";
import { api } from "~/utils/api";
import haversine from "~/utils/haversine";


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: session }),
    transformer: superjson,
  });

  const [cuisines, restaurants, user] = await Promise.all([
    ssg.cuisine.getAll.prefetch(),
    ssg.restaurant.getAllApproved.prefetch(),
    ssg.user.getUser.prefetch(),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      cuisines,
      restaurants,
      user,
    },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Guest>
      <>
        <HomeHeader />
        <HomeBody />
      </>
    </Guest>
  );
};

const HomeHeader: React.FC = () => {
  const searchQuery = useHomeStore((state) => state.searchQuery);
  const search = useHomeStore((state) => state.search);
  const { data: user } = api.user.getUser.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
  return (
    <div className="from-viparyasDarkBlue/80 to-virparyasLightBrown/80 bg-gradient-to-r p-4 text-white md:p-8">
      <div className="flex w-full items-center justify-between">
        {user?.address ? (
          <Link
            className="flex items-center gap-2 rounded-xl bg-white/40 px-4 py-2"
            href="/account/information"
          >
            <HouseIcon className="md:h-6 md:w-6" />
            <p className="text-virparyasMainBlue text-xs font-semibold md:text-base md:font-bold">
              {user.address}
            </p>
          </Link>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/account">
                <AccountIcon className="h-8 w-8 fill-white md:h-10 md:w-10" />
              </Link>
              <Link href="/cart">
                <CartIcon className="h-8 w-8 fill-white md:h-10 md:w-10" />
              </Link>
            </>
          ) : (
            <Link href="/login">
              <LoginIcon className="h-8 w-8 fill-white md:h-10 md:w-10" />
            </Link>
          )}
        </div>
      </div>
      <div className="mx-auto md:w-[45rem]">
        <p className="py-4 text-xl font-medium md:text-4xl">
          What are you craving for?
        </p>
        <div className="flex h-12 w-full items-center rounded-xl bg-white/40">
          <div className="p-3">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="h-full w-full bg-transparent placeholder:text-sm placeholder:font-light placeholder:text-white focus-within:outline-none"
            placeholder="Food, drinks, restaurants, ..."
            value={searchQuery}
            onChange={(e) => search(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const HomeBody: React.FC = () => {
  const restaurantList = useHomeStore((state) => state.restaurantList);
  const selectedCuisine = useHomeStore((state) => state.selectedCuisine);
  const selectACuisine = useHomeStore((state) => state.selectACuisine);
  const unselectCuisine = useHomeStore((state) => state.unselectCuisine);
  const setRestaurantList = useHomeStore((state) => state.setRestaurantList);
  console.log(selectedCuisine);
  //get all approved restaurants prefetched on server side and store in restaurantList state on client side
  const { data: restaurantsData } = api.restaurant.getAllApproved.useQuery(
    undefined,
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    if (!restaurantsData) {
      return;
    }
    setRestaurantList(restaurantsData);
  }, [restaurantsData, setRestaurantList]);
  //function to handle selecting a cuisine
  const handleSelectCuisine = (
    cuisine: inferProcedureOutput<AppRouter["cuisine"]["getAll"]>[number]
  ) => {
    //if the selected cuisine is the same as the current selected cuisine, set the restaurant list to all restaurants and set the selected cuisine to null
    if (selectedCuisine?.id === cuisine.id) {
      unselectCuisine();
      return;
    }

    //if the selected cuisine is not the same as the current selected cuisine, set the restaurant list to all restaurants filtered by cuisine and set the selected cuisine to the selected cuisine
    selectACuisine(cuisine);
  };

  const { data: cuisines } = api.cuisine.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <>
      <div className="bg-virparyasBackground text-virparyasMainBlue flex flex-col gap-4 px-4 py-6 md:flex-row md:gap-8">
        <div className="shrink-0">
          <div className="flex flex-col gap-4">
            <p className="mb-4 text-xl font-bold">Cuisines</p>
            <div className="grid grid-flow-col grid-rows-2 gap-4 overflow-x-auto md:grid-flow-row md:grid-cols-1 md:grid-rows-none">
              {cuisines &&
                cuisines.map((cuisine) => (
                  <button
                    className={`flex w-40 min-w-full items-center gap-4 rounded-xl p-4 md:w-48 ${
                      selectedCuisine?.id === cuisine.id
                        ? "bg-virparyasMainBlue text-white"
                        : "bg-white"
                    }`}
                    key={cuisine.id}
                    onClick={() => void handleSelectCuisine(cuisine)}
                  >
                    <Image
                      src={cuisine.image}
                      width={24}
                      height={24}
                      alt="cuisine-logo"
                      className={`${
                        selectedCuisine?.id === cuisine.id
                          ? "brightness-0 invert"
                          : ""
                      }`}
                    />
                    <p className="truncate text-sm font-semibold">
                      {cuisine.name}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>
        {restaurantList ? (
          <div className="flex grow flex-col gap-4">
            {restaurantList.filter((restaurant) => !!restaurant.favorite) && (
              <div className="flex flex-col gap-4">
                <p className="text-xl font-bold">Favorites</p>
                <div className="grid grid-flow-col grid-rows-1 gap-4 overflow-x-scroll md:grid-cols-3 md:grid-rows-none md:overflow-x-visible">
                  {restaurantList
                    .filter((restaurant) => {
                      if (restaurant.favorite.length > 0) {
                        return true;
                      }
                      return false;
                    })
                    .map((restaurant) => (
                      <></>
                      // <RestaurantFavoriteCard
                      //   restaurant={restaurant}
                      //   key={restaurant.id}
                      // />
                    ))}
                </div>
              </div>
            )}

            <RestaurantCardSection />
          </div>
        ) : (
          <div className="grow">
            <div className="mx-auto mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 md:w-96 md:p-12">
              <SleepIcon />
              <p className="text-center text-xl font-bold">
                Sorry, we couldn&apos;t find what you&apos;re looking for
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const RestaurantCardSection: React.FC = () => {
  const restaurantList = useHomeStore((state) => state.restaurantList);
  const selectedCuisine = useHomeStore((state) => state.selectedCuisine);
  const setRestaurantList = useHomeStore((state) => state.setRestaurantList);
  const favoriteARestaurant = useHomeStore(
    (state) => state.favoriteARestaurant
  );
  const unfavoriteARestaurant = useHomeStore(
    (state) => state.unfavoriteARestaurant
  );

  const utils = api.useContext();

  const favoriteMutation = api.user.favoriteRestaurant.useMutation({
    onSuccess: (data) => {
      favoriteARestaurant(data.restaurantId);
    },

    onSettled: () => {
      void utils.restaurant.getAllApproved.invalidate();
    },
  });

  const handleFavorite = (id: string) => {
    favoriteMutation.mutate({
      restaurantId: id,
    });
  };

  const unfavotiteMutation = api.user.unfavoriteRestaurant.useMutation({
    onSuccess: (data) => {
      unfavoriteARestaurant(data.restaurantId);
    },
    onSettled: () => {
      void utils.restaurant.getAllApproved.invalidate();
    },
  });

  const handleUnfavorite = (id: string) => {
    unfavotiteMutation.mutate({
      restaurantId: id,
    });
  };

  const { data: user } = api.user.getUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold">
        {!selectedCuisine ? "Recommeded for you" : selectedCuisine.name}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {restaurantList.map((restaurant) => (
          <div
            className="relative w-full min-w-[16rem] overflow-hidden rounded-2xl bg-white md:w-full md:min-w-0"
            key={restaurant.id}
          >
            <Link
              href={`/restaurant/${restaurant.name}/${restaurant.id}`}
              className="relative"
            >
              <div className="relative h-28">
                <Image
                  src={restaurant.image || ""}
                  fill
                  alt="Restaurant Image"
                  className="object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-xl font-semibold">{restaurant.name}</p>
                {user && user.latitude && user.longitude && (
                  <p className="text-xs">
                    $
                    {Math.max(
                      Math.round(
                        haversine(
                          restaurant.latitude,
                          restaurant.longitude,
                          user.latitude,
                          user.longitude
                        ) * 1.2
                      ),
                      5
                    )}{" "}
                    - $
                    {Math.max(
                      Math.round(
                        haversine(
                          restaurant.latitude,
                          restaurant.longitude,
                          user.latitude,
                          user.longitude
                        ) * 1.5
                      ),
                      6
                    )}{" "}
                    Delivery Fee
                  </p>
                )}
              </div>
            </Link>
            {unfavotiteMutation.isLoading ? (
              <div className="absolute right-0 top-0 z-10 m-2 rounded-full bg-white p-2">
                <Loading className="fill-virparyasMainBlue h-5 w-5 animate-spin text-gray-200" />
              </div>
            ) : (
              <button
                type="button"
                className="absolute right-0 top-0 z-10 m-2 rounded-full bg-white p-2"
                onClick={() => handleUnfavorite(restaurant.id)}
              >
                <HeartIcon className="fill-virparyasMainBlue" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;