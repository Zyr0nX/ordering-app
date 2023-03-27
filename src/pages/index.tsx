import { type GetServerSidePropsContext, type NextPage } from "next";
import { type InferGetServerSidePropsType } from "next";
import Guest from "~/components/layouts/Guest";
import HomeBody from "~/components/ui/HomeBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ cuisines, restaurants }) => {
  return (
    <Guest>
      <>
        <HomeBody cuisines={cuisines} restaurants={restaurants} />
      </>
    </Guest>
  );
};

export default Home;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const [cuisines, restaurants] = await Promise.all([
    prisma.cuisine.findMany(),
    prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        favorite: {
          where: {
            userId: session?.user.id || "",
          },
        },
        cuisine: true,
      },
    }),
  ]);

  return {
    props: {
      cuisines,
      restaurants,
    },
  };
};
