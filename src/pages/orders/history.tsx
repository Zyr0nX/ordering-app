import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import SuperJSON from "superjson";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { appRouter } from "~/server/api/root";
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

  await helpers.order.getOrderHistoryForUser.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const History: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Order History" />
        <GuestOrderHistoryBody />
      </>
    </Guest>
  );
};

const GuestOrderHistoryBody: React.FC = () => {
  const { data: orderHistory } = api.order.getOrderHistoryForUser.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );
  if (!orderHistory) return null;
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
      className="m-4"
    >
      <Masonry gutter={"16px"}>
        {orderHistory.map((order) => (
          <div
            className="h-fit overflow-hidden rounded-2xl bg-white shadow-lg"
            key={order.id}
          >
            <Link href={`/orders/VP-${order.id}`}>
              <div className="relative overflow-hidden text-white">
                {order.restaurant.image && (
                  <Image
                    src={order.restaurant.image}
                    fill
                    alt="Restaurant Image"
                    className="object-cover brightness-75"
                    priority
                  />
                )}
                <div className="relative flex justify-between p-4">
                  <div className="flex w-fit justify-center rounded-xl bg-white/40 px-2 py-1 font-medium text-black">
                    {order.createdAt.toLocaleString("en-US", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div
                    className={`flex w-fit justify-center rounded-xl px-2 py-1 font-medium ${
                      order.status === "PLACED" ||
                      order.status === "PREPARING" ||
                      order.status === "READY_FOR_PICKUP" ||
                      order.status === "DELIVERING"
                        ? "bg-virparyasLightBlue"
                        : ""
                    }${
                      order.status === "DELIVERED" ? "bg-virparyasGreen" : ""
                    }${
                      order.status === "REJECTED_BY_RESTAURANT" ||
                      order.status === "REJECTED_BY_SHIPPER"
                        ? "bg-virparyasRed"
                        : ""
                    }`}
                  >
                    {(order.status === "PLACED" ||
                      order.status === "PREPARING" ||
                      order.status === "READY_FOR_PICKUP" ||
                      order.status === "DELIVERING") && <p>In Progress</p>}
                    {order.status === "DELIVERED" && <p>Delivered</p>}
                    {(order.status === "REJECTED_BY_RESTAURANT" ||
                      order.status === "REJECTED_BY_SHIPPER") && (
                      <p>Cancelled</p>
                    )}
                  </div>
                </div>

                <div className="relative p-4 md:p-6">
                  <p className="mt-12 text-2xl font-bold md:mt-12 md:text-4xl">
                    {order.restaurant.name}
                  </p>
                  <p className="mt-1 text-xs md:text-base">
                    {order.restaurant.address}
                  </p>
                </div>
              </div>

              <div className="p-4 text-virparyasMainBlue md:p-6">
                <div className="my-2 flex flex-col gap-4 md:gap-8">
                  <div>
                    <ul className="flex list-decimal flex-col gap-2">
                      {order.orderFood.map((food) => (
                        <li
                          className="ml-4 marker:font-bold md:marker:text-lg"
                          key={food.id}
                        >
                          <div className="flex justify-between font-bold md:text-lg">
                            <p>{food.foodName}</p>
                            <p>
                              {food.price.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </p>
                          </div>

                          <p className="my-1 text-sm font-light md:font-normal">
                            {food.foodOption}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between">
                      <p>Shipping:</p>
                      <p>
                        {order.shippingFee.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="h-0.5 bg-virparyasSeparator" />
                  <div className="flex justify-between font-bold md:text-lg">
                    <p>Total:</p>
                    <p>
                      {(
                        order.orderFood.reduce((acc, cur) => {
                          return acc + cur.price;
                        }, 0) + order.shippingFee
                      ).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
};

export default History;
