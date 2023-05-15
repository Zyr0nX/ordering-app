import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { signOut } from "next-auth/react";
import React from "react";
import SuperJSON from "superjson";
import MainButton from "~/components/common/MainButton";
import CategoryIcon from "~/components/icons/CategoryIcon";
import LogoutIcon from "~/components/icons/LogoutIcon";
import RequestIcon from "~/components/icons/RequestIcon";
import RestaurantIcon from "~/components/icons/RestaurantIcon";
import ShipperIcon from "~/components/icons/ShipperIcon";
import UserIcon from "~/components/icons/UserIcon";
import Admin from "~/components/layouts/Admin";
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

  if (!session || session.user.role !== "ADMIN") {
    return {
      notFound: true,
    };
  }

  await helpers.admin.getStats.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Index: NextPage = () => {
  return (
    <Admin>
      <>
        <div>
          <AdminHeader />
        </div>
        <div className="relative -top-8 mx-4 md:-top-16 md:mx-20">
          <AdminBody />
        </div>
      </>
    </Admin>
  );
};

const AdminHeader: React.FC = () => {
  const { data: stat } = api.admin.getStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return (
    <div className="relative flex items-center justify-center bg-gradient-to-r from-viparyasDarkBlue/80 to-viparyasTeal/80 pb-24 pt-16 text-white md:pb-32 md:pt-8">
      <button
        className="absolute right-0 top-0 p-5"
        onClick={() => void signOut()}
      >
        <LogoutIcon />
      </button>
      <div>
        <p className="mb-5 text-center text-xl md:text-2xl">
          This month&apos;s stats
        </p>
        <div className="flex">
          <div className="w-[50vw] text-center">
            <p className="text-5xl font-bold md:text-8xl">
              {stat?.totalOrdersThisMonth}
            </p>
            <p className="font-thin md:text-4xl">Completed Order</p>
          </div>
          <div className="w-[50vw] text-center">
            <p className="text-5xl font-bold md:text-8xl">
              ${stat?.totalRevenueThisMonth.toFixed(2)}
            </p>
            <p className="font-thin md:text-4xl">Total Income</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminBody: React.FC = () => {
  const { data: stat } = api.admin.getStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return (
    <div className="mx-2 grid grid-cols-2 gap-4 md:mx-12">
      <MainButton
        text={
          stat?.totalRestaurants
            ? `Restaurants (${stat?.totalRestaurants})`
            : "Restaurants"
        }
        icon={<RestaurantIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/restaurants"
      />
      <MainButton
        text={
          stat?.totalShippers
            ? `Shippers (${stat?.totalRestaurants})`
            : "Shippers"
        }
        icon={<ShipperIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/shippers"
      />
      <MainButton
        text={stat?.totalUsers ? `Users (${stat?.totalUsers})` : "Users"}
        icon={<UserIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/users"
      />
      <MainButton
        text={
          stat?.totalRequests ? `Requests (${stat?.totalRequests})` : "Requests"
        }
        icon={<RequestIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/requests"
      />
      <MainButton
        text="Cuisines"
        icon={<CategoryIcon className="md:h-24 md:w-24" />}
        href="/manage/admin/cuisines"
      />
    </div>
  );
};

export default Index;
