import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type inferProcedureOutput } from "@trpc/server";
import fuzzysort from "fuzzysort";
import {
  type NextPage,
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import React, { Fragment, useEffect, useState } from "react";
import superjson from "superjson";
import { create } from "zustand";
import InfoIcon from "~/components/icons/InfoIcon";
import SearchIcon from "~/components/icons/SearchIcon";
import SleepIcon from "~/components/icons/SleepIcon";
import Shipper from "~/components/layouts/Shipper";
import ManageShipperHeader from "~/components/ui/ManageShipperHeader";
import { type AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!session || session.user.role !== "SHIPPER") {
    return {
      notFound: true,
    };
  }
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({
      session,
    }),
    transformer: superjson,
  });

  await helpers.order.getShipperOrderHistory.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

interface ManageShipperOrderHistoryState {
  searchQuery: string;
  orderHistory: inferProcedureOutput<
    AppRouter["order"]["getShipperOrderHistory"]
  >;
  orderHistoryData: inferProcedureOutput<
    AppRouter["order"]["getShipperOrderHistory"]
  >;
  search: (searchQuery: string) => void;
}

const useManageShipperOrderHistoryStore =
  create<ManageShipperOrderHistoryState>((set) => ({
    searchQuery: "",
    orderHistory: [],
    orderHistoryData: [],
    search: (searchQuery) => {
      set({ searchQuery: searchQuery });
      set((state) => ({
        orderHistory: fuzzysort
          .go(searchQuery, state.orderHistoryData, {
            keys: ["id", "user.name", "user.email", "user.phone"],
            all: true,
          })
          .map((result) => result.obj),
      }));
    },
  }));

const History: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Shipper>
      <>
        <ManageShipperHeader title="Order History" />
        <ManageShipperOrderHistoryBody />
      </>
    </Shipper>
  );
};

const ManageShipperOrderHistoryBody: React.FC = () => {
  const { data: shipperOrderHistoryData } =
    api.order.getShipperOrderHistory.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 5000,
    });
  useEffect(() => {
    if (useManageShipperOrderHistoryStore.getState().searchQuery) {
      useManageShipperOrderHistoryStore.setState({
        orderHistoryData: shipperOrderHistoryData,
      });
      return;
    }
    useManageShipperOrderHistoryStore.setState({
      orderHistoryData: shipperOrderHistoryData,
      orderHistory: shipperOrderHistoryData,
    });
  }, [shipperOrderHistoryData]);

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex flex-col gap-4">
        <Search />
        <OrderHistory />
      </div>
    </div>
  );
};

const Search: React.FC = () => {
  const search = useManageShipperOrderHistoryStore((state) => state.search);
  const searchQuery = useManageShipperOrderHistoryStore(
    (state) => state.searchQuery
  );

  return (
    <div className="flex h-12 w-full overflow-hidden rounded-2xl bg-white">
      <input
        type="text"
        className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => search(e.target.value)}
      />

      <div className="flex items-center bg-virparyasMainBlue px-4">
        <SearchIcon className="h-8 w-8 fill-white" />
      </div>
    </div>
  );
};

const OrderHistory: React.FC = () => {
  const orderHistory = useManageShipperOrderHistoryStore(
    (state) => state.orderHistory
  );

  return (
    <>
      {orderHistory.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
          <p className="text-xl font-semibold">No order found</p>
          <SleepIcon />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orderHistory.map((order) => (
            <OrderHistoryCard order={order} key={order.id} />
          ))}
        </div>
      )}
    </>
  );
};

interface OrderHistoryCardProps {
  order: inferProcedureOutput<
    AppRouter["order"]["getShipperOrderHistory"]
  >[number];
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const total = order.orderFood.reduce(
    (acc, food) => acc + food.quantity * food.price,
    0
  );
  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div
            className={
              order.status === "REJECTED_BY_SHIPPER"
                ? "text-virparyasRed"
                : "text-virparyasGreen"
            }
          >
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              Order VP-{order.id}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {total.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
          </div>
          <div className="flex">
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsInfoOpen(true)}
            >
              <InfoIcon className="h-8 w-8 fill-virparyasMainBlue md:h-10 md:w-10" />
            </button>
          </div>
        </div>
      </div>
      <Transition appear show={isInfoOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsInfoOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Order VP-{order.id}
                  </Dialog.Title>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p>{order.user.name}</p>
                      <p>{order.user.address}</p>
                      <p>{order.user.phoneNumber}</p>
                    </div>
                    <div className="h-0.5 bg-virparyasSeparator" />
                    <ul className="ml-4 flex list-decimal flex-col gap-2">
                      {order.orderFood.map((food) => (
                        <li
                          className="marker:text-sm marker:font-bold"
                          key={food.id}
                        >
                          <div className="flex justify-between font-bold">
                            <p>
                              {food.foodName} ×{food.quantity}
                            </p>
                            <p>
                              $
                              {(food.price * food.quantity).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>

                          <p className="my-1 text-sm font-light">
                            {food.foodOption}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="h-0.5 bg-virparyasSeparator" />
                    <div className="flex justify-between">
                      <p>Total:</p>
                      <p>
                        $
                        {total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    {order.status === "REJECTED_BY_SHIPPER" && (
                      <>
                        <div className="h-0.5 bg-virparyasSeparator" />
                        <p>
                          <span className="font-bold">
                            Reason for cancelling:
                          </span>{" "}
                          Restaurant ran out of ingredients
                        </p>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default History;
