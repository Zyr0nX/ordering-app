import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { type GetServerSidePropsContext } from "next";
import React, {useState} from "react";
import superjson from "superjson";
import Restaurant from "~/components/layouts/Restaurant";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session }),
    transformer: superjson,
  });

  void ssg.order.getRestaurantOrderHistory.prefetch();

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

const History = () => {
  const utils = api.useContext();

  const [orderHistory, setOrderHistory] = useState([]);

  return (
    <Restaurant>
      <div>History</div>
    </Restaurant>
  );
};

export default History;