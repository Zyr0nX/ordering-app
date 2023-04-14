import { createServerSideHelpers } from "@trpc/react-query/server";
import { type inferProcedureOutput } from "@trpc/server";
import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import superjson from "superjson";
import { create } from "zustand";
import Checkbox from "~/components/common/Checkbox";
import CommonButton from "~/components/common/CommonButton";
import FoodOptionDialog from "~/components/common/FoodOptionDialog";
import Loading from "~/components/common/Loading";
import AccountIcon from "~/components/icons/AccountIcon";
import BackArrowIcon from "~/components/icons/BackArrowIcon";
import CartIcon from "~/components/icons/CartIcon";
import EmptyStarIcon from "~/components/icons/EmptyStarIcon";
import FullStarIcon from "~/components/icons/FullStarIcon";
import HalfStarIcon from "~/components/icons/HalfStarIcon";
import LoginIcon from "~/components/icons/LoginIcon";
import Guest from "~/components/layouts/Guest";
import { type AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";
import haversine from "~/utils/haversine";


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  if (!context.query.slug || !context.query.slug[1]) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession(context);
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: session }),
    transformer: superjson,
  });
  if (!session) {
    const restaurant = await ssg.restaurant.get.fetch({
      id: context.query.slug[1],
    });
    if (!restaurant) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        trpcState: ssg.dehydrate(),
        id: context.query.slug[1],
      },
    };
  }

  const [restaurant] = await Promise.all([
    ssg.restaurant.get.fetch({ id: context.query.slug[1] }),
    ssg.user.getUser.prefetch(),
  ]);

  if (!restaurant) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: context.query.slug[1],
    },
  };
};

interface RestaurantDetailState {
  restaurant: inferProcedureOutput<AppRouter["restaurant"]["get"]>;
  user: inferProcedureOutput<AppRouter["user"]["getUser"]>;
}

const useRestaurantDetailStore = create<RestaurantDetailState>(() => ({
  restaurant: null,
  user: null,
}));

const RestarantDetail: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data: restaurant } = api.restaurant.get.useQuery(
    { id },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const { data: user } = api.user.getUser.useQuery();

  useEffect(() => {
    useRestaurantDetailStore.setState({ restaurant });
  }, [restaurant]);

  useEffect(() => {
    useRestaurantDetailStore.setState({ user });
  }, [user]);

  return (
    <Guest>
      <>
        <RestaurantDetailHeader />
        <RestaurantDetailBody />
      </>
    </Guest>
  );
};

const RestaurantDetailHeader: React.FC = () => {
  const restaurant = useRestaurantDetailStore((state) => state.restaurant);
  const user = useRestaurantDetailStore((state) => state.user);

  const distance = useMemo(() => {
    if (
      !restaurant?.latitude ||
      !restaurant?.longitude ||
      !user?.latitude ||
      !user?.longitude
    ) {
      return null;
    }
    return haversine(
      restaurant?.latitude,
      restaurant?.longitude,
      user?.latitude,
      user?.longitude
    );
  }, [
    restaurant?.latitude,
    restaurant?.longitude,
    user?.latitude,
    user?.longitude,
  ]);

  if (!restaurant) {
    return null;
  }

  return (
    <div className="relative">
      {restaurant.image && (
        <Image
          src={restaurant.image}
          fill
          alt="Restaurant Image"
          className="object-cover brightness-50"
          priority
        />
      )}

      <div className="relative w-full p-4 text-white md:p-8">
        <div className="flex w-full items-center justify-between md:absolute md:w-[calc(100%-4rem)]">
          <Link href="/">
            <BackArrowIcon className="fill-white md:h-10 md:w-10" />
          </Link>
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
        <div className="mt-4 md:mx-32 md:mt-2">
          <h1 className="text-2xl font-bold md:text-5xl">{restaurant.name}</h1>
          {distance && (
            <p className="mt-2 text-sm md:text-2xl">
              ${Math.max(Math.round(distance * 1.2), 5)} - $
              {Math.max(Math.round(distance * 1.5), 6)} Delivery Fee
            </p>
          )}

          <p className="mt-1 text-xs md:text-base">{restaurant.address}</p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingDiff =
                i - Math.round((restaurant.rating || 5) * 2) / 2;
              if (ratingDiff <= -1) {
                return <FullStarIcon key={i} className="md:h-8 md:w-8 fill-white" />;
              } else if (ratingDiff < 0) {
                return <HalfStarIcon key={i} className="md:h-8 md:w-8 fill-white" bgColor="#000" bgOpacity={0.5} />;
              } else {
                return <EmptyStarIcon key={i} className="md:h-8 md:w-8 fill-white" bgColor="#000" bgOpacity={0.5} />;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const RestaurantDetailBody: React.FC = () => {
  const restaurant = useRestaurantDetailStore((state) => state.restaurant);
  if (!restaurant) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:px-20 md:py-10 lg:grid-cols-3">
      {restaurant.food.map((food) => (
        <FoodCard food={food} key={food.id} />
      ))}
    </div>
  );
};

const FoodCard: React.FC<{
  food: Pick<
    NonNullable<inferProcedureOutput<AppRouter["restaurant"]["get"]>>,
    "food"
  >["food"][number];
}> = ({ food }) => {
  const user = useRestaurantDetailStore((state) => state.user);

  const [listFoodOptionItem, setListFoodOptionItem] = useState<
    Pick<
      NonNullable<inferProcedureOutput<AppRouter["restaurant"]["get"]>>,
      "food"
    >["food"][number]["foodOption"][number]["foodOptionItem"]
  >([]);

  const [totalPrice, setTotalPrice] = useState(food.price);

  const handleFoodOptionItem = (
    item: Pick<
      NonNullable<inferProcedureOutput<AppRouter["restaurant"]["get"]>>,
      "food"
    >["food"][number]["foodOption"][number]["foodOptionItem"][number]
  ) => {
    if (listFoodOptionItem.includes(item)) {
      setListFoodOptionItem(listFoodOptionItem.filter((i) => i !== item));
      setTotalPrice(totalPrice - item.price);
    } else {
      setListFoodOptionItem((prevState) => [...prevState, item]);
      setTotalPrice(totalPrice + item.price);
    }
  };

  const resetState = () => {
    setTimeout(() => {
      setTotalPrice(food.price);
    }, 300);
    setListFoodOptionItem([]);
    setIsOpen(false);
  };

  const addToCartMutation = api.cart.addItems.useMutation();

  const AddToCart = async () => {
    await toast.promise(
      addToCartMutation.mutateAsync({
        foodId: food.id,
        quantity: 1,
        foodOptionids: listFoodOptionItem.map((item) => item.id),
      }), {
        loading: 'Adding to cart...',
        success: 'Added to cart!',
        error: 'Failed to add to cart',
      }
    );
    resetState();
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className="flex h-28 overflow-hidden rounded-2xl bg-white md:h-36"
        key={food.id}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-28 shrink-0 md:w-36">
          <Image
            src={food.image}
            fill
            alt="Restaurant Image"
            className="object-cover"
            priority
          />
        </div>
        <div className="text-virparyasMainBlue p-4">
          <div className="h-full">
            <h2 className="line-clamp-1 font-bold">{food.name}</h2>
            <p className="mt-1 text-sm">${food.price.toString()}</p>
            <p className="mt-1 line-clamp-2 text-xs font-light md:line-clamp-4">
              {food.description}
            </p>
          </div>
        </div>
      </div>
      <FoodOptionDialog
        isOpen={isOpen}
        onClose={resetState}
        setIsOpen={setIsOpen}
      >
        <div className="relative">
          <Image
            src={food.image}
            fill
            alt="Restaurant Image"
            className="object-cover brightness-50"
          />
          <div className="relative px-6 pb-4 pt-16 text-white md:px-16 md:pb-6 md:pt-20">
            <h2 className="text-lg font-bold md:text-4xl">{food.name}</h2>
            <p className="mt-1 text-sm md:text-2xl">${food.price.toString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 bg-white p-4 md:grid-cols-2 md:gap-16 md:px-16 md:py-8">
          {food.foodOption.map((option) => (
            <div key={option.id} className="text-virparyasMainBlue">
              <p className="mb-2 text-lg font-bold">{option.name}</p>
              <div className="flex flex-col gap-2">
                {option.foodOptionItem.map((item) => (
                  <Fragment key={item.id}>
                    <div className="flex justify-between">
                      <Checkbox
                        label={item.name}
                        handleChange={() => handleFoodOptionItem(item)}
                      />
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-virparyasBackground h-0.5 w-full last:hidden"></div>
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center bg-white px-8 pb-4">
          {addToCartMutation.isLoading ? (
            <Loading className="fill-virparyasMainBlue h-12 w-12 animate-spin text-gray-200" />
          ) : !user ? (
            <Link
              href="/signin"
              className="bg-virparyasMainBlue flex w-full max-w-md items-center justify-center rounded-xl p-3 font-bold text-white"
            >
              Login to Add to Cart
            </Link>
          ) : (
            <CommonButton
              text={`Add to Cart - $${totalPrice.toFixed(2)}`}
              onClick={() => void AddToCart()}
            />
          )}
        </div>
      </FoodOptionDialog>
    </>
  );
};

export default RestarantDetail;