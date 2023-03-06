import { type GetServerSidePropsContext, type NextPage } from "next";
import { type InferGetServerSidePropsType } from "next";
import Guest from "~/components/layouts/Guest";
import HomeBody from "~/components/ui/HomeBody";
import HomeHeader from "~/components/ui/HomeHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ restaurants }) => {
  return (
    <Guest>
      <>
        <HomeHeader />
        <HomeBody restaurants={restaurants} />
      </>
    </Guest>
  );
};

export default Home;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const restaurants = await prisma.restaurant.findMany({
    where: {
      approved: "APPROVED",
    },
    include: {
      Favorite: {
        where: {
          userId: session?.user.id,
        },
      },
    },
  });
  return {
    props: {
      restaurants,
    },
  };
};
