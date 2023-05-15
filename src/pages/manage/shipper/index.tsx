import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { signOut } from "next-auth/react";
import SuperJSON from "superjson";
import LogoutIcon from "~/components/icons/LogoutIcon";
import Shipper from "~/components/layouts/Shipper";
import ShipperHomeBody from "~/components/ui/ShipperHomeBody";
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

  if (!session || session.user.role !== "SHIPPER") {
    return {
      notFound: true,
    };
  }

  await helpers.shipper.getStats.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Index: NextPage = () => {
  return (
    <Shipper>
      <>
        <ShipperHomeHeader />
        <div className="relative -top-8 mx-4 md:-top-16 md:mx-20">
          <ShipperHomeBody />
        </div>
      </>
    </Shipper>
  );
};

const ShipperHomeHeader: React.FC = () => {
  const { data: stat } = api.shipper.getStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return (
    <div className="relative flex items-center justify-center bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightRed/80 pb-24 pt-16 text-white md:pb-32 md:pt-8">
      <button
        className="absolute right-0 top-0 p-5"
        onClick={() => void signOut()}
      >
        <LogoutIcon />
      </button>
      {stat?.status ? (
        <div>
          <p className="mb-5 text-center text-xl md:text-2xl">All time stats</p>
          <div className="flex">
            <div className="w-[50vw] text-center">
              <p className="text-5xl font-bold md:text-8xl">
                {stat?.totalOrders}
              </p>
              <p className="font-thin md:text-4xl">Completed Order</p>
            </div>
            <div className="w-[50vw] text-center">
              <p className="text-5xl font-bold md:text-8xl">
                ${stat?.totalRevenue.toFixed(2)}
              </p>
              <p className="font-thin md:text-4xl">Total Income</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <p className="text-2xl font-bold md:text-5xl">
            Your account has been disabled
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
