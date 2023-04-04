import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { inferProcedureOutput } from "@trpc/server";
import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import SuperJSON from "superjson";
import { useDebouncedCallback } from "use-debounce";
import { create } from "zustand";
import CommonButton from "~/components/common/CommonButton";
import Loading from "~/components/common/Loading";
import NoCartIcon from "~/components/icons/NoCartIcon";
import RedTrashCan from "~/components/icons/RedTrashCan";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
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

  await ssg.cart.getCart.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

interface CartState {
  cart: inferProcedureOutput<AppRouter["cart"]["getCart"]>;
  total: number;
  removeCartItem: (id: string) => void;
  increaseCartItemQuantity: (id: string) => void;
  decreaseCartItemQuantity: (id: string) => void;
}

const useCartStore = create<CartState>(() => ({
  cart: [],
  total: 0,
  removeCartItem: (id: string) => {
    const newCart = useCartStore
      .getState()
      .cart.filter((item) => item.id !== id);
    useCartStore.setState({ cart: newCart });
    useCartStore.setState({
      total:
        useCartStore.getState().total -
        useCartStore
          .getState()
          .cart.filter((item) => item.id === id)
          .map((item) => item.food.price * item.quantity)
          .reduce((a, b) => a + b, 0),
    });
  },

  increaseCartItemQuantity: (id: string) => {
    const newCart = useCartStore.getState().cart.map((item) => {
      if (item.id === id) {
        item.quantity += 1;
      }
      return item;
    });
    useCartStore.setState({ cart: newCart });
    useCartStore.setState({
      total:
        useCartStore.getState().total +
        useCartStore
          .getState()
          .cart.filter((item) => item.id === id)
          .map((item) => item.food.price)
          .reduce((a, b) => a + b, 0),
    });
  },

  decreaseCartItemQuantity: (id: string) => {
    const newCart = useCartStore.getState().cart.map((item) => {
      if (item.id === id) {
        item.quantity -= 1;
      }
      return item;
    });
    useCartStore.setState({ cart: newCart });
    useCartStore.setState({
      total:
        useCartStore.getState().total -
        useCartStore
          .getState()
          .cart.filter((item) => item.id === id)
          .map((item) => item.food.price)
          .reduce((a, b) => a + b, 0),
    });
  },
}));

const Cart: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { data: cart } = api.cart.getCart.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    useCartStore.setState({ cart });
  }, [cart]);

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
}

const CartBody: React.FC = () => {
  const cartData = useCartStore((state) => state.cart);

  //group cart by restaurant
  const carts: Cart[] = cartData
    .map((item) => item.food.restaurant)
    .filter(
      (value, index, self) => index === self.findIndex((t) => t.id === value.id)
    )
    .map((restaurant) => {
      return {
        restaurant,
        items: cartData.filter(
          (item) => item.food.restaurant.id === restaurant.id
        ),
      };
    });

  if (carts.length === 0) {
    return (
      <div className="text-virparyasMainBlue m-4 mx-auto flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 md:w-fit">
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
    <div className="mx-4 my-6 grid grid-cols-1 gap-4 md:mx-32 md:my-8 md:grid-cols-2 md:gap-8">
      {carts.map((cart) => (
        <CartCard cart={cart} key={cart.restaurant.id} />
      ))}
    </div>
  );
};

const CartCard: React.FC<{ cart: Cart }> = ({ cart }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [totalPrice, setTotalPrice] = useState(
    cart.items.reduce((acc, cur) => {
      return (
        acc +
        (cur.food.price +
          cur.foodOption
            .map((option) => option.price)
            .reduce((a, b) => a + b, 0)) *
          cur.quantity
      );
    }, 0)
  );

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
        <div className="text-virparyasMainBlue m-4 md:m-6">
          <div className="mx-4 my-2 flex flex-col gap-4 md:gap-8">
            <ul className="flex list-decimal flex-col gap-2">
              {cart.items.map((cardItem) => (
                <ItemCart
                  cardItem={cardItem}
                  key={cardItem.id}
                  setTotalPrice={setTotalPrice}
                  totalPrice={totalPrice}
                  setIsLoading={setIsLoading}
                />
              ))}
            </ul>
            <div className="flex justify-center">
              {isLoading ? (
                <Loading className="fill-virparyasMainBlue h-12 w-12 animate-spin text-gray-200" />
              ) : (
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { id: cart.restaurant.id },
                  }}
                  className="bg-virparyasMainBlue flex max-w-xs grow items-center justify-center rounded-xl p-3 font-bold text-white"
                >
                  Checkout -{" "}
                  {totalPrice.toLocaleString("en-US", {
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
  cardItem: inferProcedureOutput<AppRouter["cart"]["getCart"]>[number];
  totalPrice: number;
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ItemCart: React.FC<ItemCartProps> = ({
  cardItem,
  totalPrice,
  setTotalPrice,
  setIsLoading,
}) => {
  const cart1 = useCartStore((state) => state.cart);

  const updateItemQuantityMutation = api.cart.updateItemQuantity.useMutation();
  const utils = api.useContext();
  const [quantity, setQuantity] = React.useState(cardItem.quantity);

  const updateDebounce = useDebouncedCallback(async () => {
    await updateItemQuantityMutation.mutateAsync({
      cartItemId: cardItem.id,
      quantity: quantity,
    });
    setIsLoading(false);
  }, 500);

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setIsLoading(true);
    setQuantity(quantity - 1);
    setTotalPrice(totalPrice - cardItem.food.price);
    void updateDebounce();
  };

  const handleIncrement = () => {
    if (quantity >= Number(cardItem.food.quantity)) return;
    setIsLoading(true);
    setQuantity(quantity + 1);
    setTotalPrice(totalPrice + cardItem.food.price);
    void updateDebounce();
  };

  const handleUpdateQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    setQuantity(Number(e.target.value));
    setTotalPrice(
      totalPrice -
        cardItem.food.price * quantity +
        cardItem.food.price * Number(e.target.value)
    );
    void updateDebounce();
  };

  const removeItemMutation = api.cart.removeItem.useMutation({
    onSettled: () => {
      void utils.cart.getCart.invalidate();
      setIsLoading(false);
    },
  });

  const handleRemoveItem = () => {
    removeItemMutation.mutate({ cartItemId: cardItem.id });
  };

  const price =
    (cardItem.food.price +
      cardItem.foodOption
        .map((option) => option.price)
        .reduce((a, b) => a + b, 0)) *
    quantity;

  return (
    <li className="marker:font-bold md:marker:text-lg">
      <div className="flex justify-between font-bold md:text-lg">
        <p>{cardItem.food.name}</p>
        <p>${price.toFixed(2)}</p>
      </div>

      <p className="my-1 text-sm font-light md:font-normal">
        {cardItem.foodOption.map((option) => option.name).join(", ")}
      </p>
      <div className="flex items-center gap-4">
        <div className="bg-virparyasBackground flex w-fit items-center rounded-lg text-sm font-medium">
          <button type="button" className="px-2 py-1" onClick={handleDecrement}>
            -
          </button>
          <input
            type="number"
            className="w-8 bg-transparent text-center focus-within:outline-none"
            min={1}
            max={Number(cardItem.food.quantity)}
            value={quantity}
            onChange={handleUpdateQuantity}
          />
          <button type="button" className="px-2 py-1" onClick={handleIncrement}>
            +
          </button>
        </div>
        <button type="button" onClick={handleRemoveItem}>
          <RedTrashCan />
        </button>
      </div>
    </li>
  );
};

export default Cart;