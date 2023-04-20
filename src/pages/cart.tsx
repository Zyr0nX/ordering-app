import { createServerSideHelpers } from "@trpc/react-query/server";
import { type inferProcedureOutput } from "@trpc/server";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import SuperJSON from "superjson";
import { useDebouncedCallback } from "use-debounce";
import { create } from "zustand";
import CommonButton from "~/components/common/CommonButton";
import Loading from "~/components/common/Loading";
import NoCartIcon from "~/components/icons/NoCartIcon";
import RedTrashCan from "~/components/icons/RedTrashCan";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { type AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: session }),
    transformer: SuperJSON,
  });

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  await helpers.cart.getCart.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

interface CartState {
  cart: {
    restaurant: inferProcedureOutput<
      AppRouter["cart"]["getCart"]
    >[number]["food"]["restaurant"];
    items: inferProcedureOutput<AppRouter["cart"]["getCart"]>;
    total: number;
  }[];

  removeCartItem: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
}

const useCartStore = create<CartState>(() => ({
  cart: [],
  removeCartItem: (id: string) => {
    if (
      useCartStore.getState().cart.length === 1 &&
      useCartStore.getState().cart[0]?.items.length === 1
    ) {
      useCartStore.setState({ cart: [] });
      return;
    }

    const newCart = useCartStore.getState().cart.map((item) => {
      item.items = item.items.filter((item) => item.id !== id);
      item.total = item.items.reduce(
        (a, b) =>
          a +
          (b.food.price + b.foodOption.reduce((a, b) => a + b.price, 0)) *
            b.quantity,
        0
      );
      return item;
    });
    useCartStore.setState({ cart: newCart });
  },

  updateCartItemQuantity: (id: string, quantity: number) => {
    const newCart = useCartStore.getState().cart.map((item) => {
      item.items = item.items.map((item) => {
        if (item.id === id) {
          item.quantity = quantity;
        }
        return item;
      });
      item.items = item.items.filter((item) => item.quantity > 0);
      item.total = item.items.reduce(
        (a, b) =>
          a +
          (b.food.price + b.foodOption.reduce((a, b) => a + b.price, 0)) *
            b.quantity,
        0
      );
      return item;
    });
    useCartStore.setState({ cart: newCart });
  },
}));

const Cart: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { data: cartData } = api.cart.getCart.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!cartData) return;
    useCartStore.setState({
      cart: cartData
        .map((item) => item.food.restaurant)
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
        )
        .map((restaurant) => {
          return {
            restaurant,
            items: cartData.filter(
              (item) => item.food.restaurant.id === restaurant.id
            ),
            total: cartData
              .filter((item) => item.food.restaurant.id === restaurant.id)
              .reduce(
                (a, b) =>
                  a +
                  (b.food.price +
                    b.foodOption.reduce((a, b) => a + b.price, 0)) *
                    b.quantity,
                0
              ),
          };
        }),
    });
  }, [cartData]);

  return (
    <Guest>
      <>
        <GuestCommonHeader text="Cart" />
        <CartBody />
      </>
    </Guest>
  );
};

interface Cart {
  restaurant: inferProcedureOutput<
    AppRouter["cart"]["getCart"]
  >[number]["food"]["restaurant"];
  items: inferProcedureOutput<AppRouter["cart"]["getCart"]>;
  total: number;
}

const CartBody: React.FC = () => {
  const cartData = useCartStore((state) => state.cart);

  if (cartData.length === 0) {
    return (
      <div className="m-4 mx-auto flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-virparyasMainBlue md:w-fit">
        <NoCartIcon className="md:h-32 md:w-32" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold md:text-3xl">
            Your cart is currently empty
          </h2>
          <p className="text-xs font-light md:text-base">
            but we have plenty of options for you to choose from
          </p>
        </div>

        <Link href="/" className="w-full">
          <CommonButton text="Continue Shopping" />
        </Link>
      </div>
    );
  }
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 639: 1, 767: 2 }}
      className="mx-4 my-6 md:mx-32 md:my-8"
    >
      <Masonry gutter="16px">
        {cartData.map((cart) => (
          <CartCard cart={cart} key={cart.restaurant.id} />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
};

const CartCard: React.FC<{ cart: Cart }> = ({ cart }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!cart.items) return null;

  return (
    <div className="h-fit overflow-hidden rounded-2xl bg-white shadow-lg">
      <Link
        href={`/restaurant/${cart.restaurant.name}/${cart.restaurant.id}`}
        className="relative overflow-hidden text-white"
      >
        {cart.restaurant.image && (
          <Image
            src={cart.restaurant.image || ""}
            fill
            alt="Restaurant Image"
            className="object-cover brightness-50"
            priority
          />
        )}

        <div className="relative p-4 md:p-6">
          <p className="mt-4 text-2xl font-bold md:mt-12 md:text-4xl">
            {cart.restaurant.name}
          </p>
          <p className="mt-1 text-xs md:text-base">{cart.restaurant.address}</p>
        </div>
      </Link>

      <div>
        <div className="m-4 text-virparyasMainBlue md:m-6">
          <div className="mx-4 my-2 flex flex-col gap-4 md:gap-8">
            <ul className="flex list-decimal flex-col gap-2">
              {cart.items.map((cartItem) => (
                <ItemCart
                  cartItem={cartItem}
                  key={cartItem.id}
                  setIsLoading={setIsLoading}
                />
              ))}
            </ul>
            <div className="flex justify-center">
              {isLoading ? (
                <Loading className="h-12 w-12 animate-spin fill-virparyasMainBlue text-gray-200" />
              ) : (
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { id: cart.restaurant.id },
                  }}
                  className="flex max-w-xs grow items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
                >
                  Checkout -{" "}
                  {cart.total.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ItemCartProps {
  cartItem: inferProcedureOutput<AppRouter["cart"]["getCart"]>[number];
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ItemCart: React.FC<ItemCartProps> = ({ cartItem, setIsLoading }) => {
  const cart = useCartStore((state) => state.cart);
  const removeCartItem = useCartStore((state) => state.removeCartItem);
  const updateCartItemQuantity = useCartStore(
    (state) => state.updateCartItemQuantity
  );

  const updateItemQuantityMutation = api.cart.updateItemQuantity.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
  });

  const updateDebounce = useDebouncedCallback(async () => {
    await toast.promise(
      updateItemQuantityMutation.mutateAsync({
        cartItemId: cartItem.id,
        quantity: cartItem.quantity,
      }),
      {
        loading: "Updating...",
        success: "Updated!",
        error: "Error updating",
      }
    );
    setIsLoading(false);
  }, 500);

  const matchingItem = cart.find((item) =>
    item.items.some((i) => i.food.id === cartItem.food.id)
  );

  const matchingQuantity = matchingItem
    ? matchingItem.items
        .filter((i) => i.food.id === cartItem.food.id)
        .reduce((acc, curr) => acc + curr.quantity, 0)
    : 0;

  const maxOption =
    cartItem.quantity + cartItem.food.quantity - matchingQuantity + 1;

  const handleUpdateQuantity = async (quantity: number) => {
    if (quantity >= maxOption) {
      updateCartItemQuantity(cartItem.id, maxOption - 1);
      return;
    }
    if (quantity === cartItem.quantity) return;
    if (quantity === 0 && cartItem.quantity === 1) return;

    if (quantity <= 0) {
      updateCartItemQuantity(cartItem.id, 1);
      setIsLoading(true);
      await updateDebounce();
      return;
    }
    updateCartItemQuantity(cartItem.id, quantity);
    setIsLoading(true);
    await updateDebounce();
  };

  const removeItemMutation = api.cart.removeItem.useMutation();

  const handleRemoveItem = async () => {
    setIsLoading(true);
    removeCartItem(cartItem.id);
    await toast.promise(
      removeItemMutation.mutateAsync({ cartItemId: cartItem.id }),
      {
        loading: "Removing...",
        success: "Removed!",
        error: "Error removing",
      }
    );
    setIsLoading(false);
  };

  const price =
    (cartItem.food.price +
      cartItem.foodOption
        .map((option) => option.price)
        .reduce((a, b) => a + b, 0)) *
    cartItem.quantity;

  return (
    <li className="marker:font-bold md:marker:text-lg">
      <div className="flex justify-between font-bold md:text-lg">
        <p>{cartItem.food.name}</p>
        <p>${price.toFixed(2)}</p>
      </div>

      <p className="my-1 text-sm font-light md:font-normal">
        {cartItem.foodOption.map((option) => option.name).join(", ")}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex w-fit items-center rounded-lg bg-virparyasBackground text-sm font-medium">
          <button
            type="button"
            className="px-2 py-1"
            onClick={() => void handleUpdateQuantity(cartItem.quantity - 1)}
          >
            -
          </button>
          <input
            type="number"
            className="w-8 bg-transparent text-center focus-within:outline-none"
            min={1}
            max={maxOption}
            value={cartItem.quantity}
            onChange={(e) => void handleUpdateQuantity(Number(e.target.value))}
          />
          <button
            type="button"
            className="px-2 py-1"
            onClick={() => void handleUpdateQuantity(cartItem.quantity + 1)}
          >
            +
          </button>
        </div>
        <button type="button" onClick={() => void handleRemoveItem()}>
          <RedTrashCan />
        </button>
      </div>
    </li>
  );
};

export default Cart;
