import { type GetServerSidePropsContext, type NextPage } from "next";
import { type InferGetServerSidePropsType } from "next";
import Guest from "~/components/layouts/Guest";
import HomeBody from "~/components/ui/HomeBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ cuisines, restaurants, user }) => {
  return (
    <Guest>
      <>
        <HomeBody cuisines={cuisines} restaurants={restaurants} user={user} />
      </>
    </Guest>
  );
};

export default Home;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!session) {
    const [cuisines, restaurants] = await Promise.all([
      prisma.cuisine.findMany(),
      prisma.restaurant.findMany({
        where: {
          approved: "APPROVED",
        },
        include: {
          favorite: {
            where: {
              userId: "",
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
  }
  const [cuisines, restaurants, user] = await Promise.all([
    prisma.cuisine.findMany(),
    prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        favorite: {
          where: {
            userId: session.user.id,
          },
        },
        cuisine: true,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    }),
  ]);

  if (user && !user.address && !user.phoneNumber && !user.addressId) {
    return {
      redirect: {
        destination: "/account/information",
        permanent: false,
      },
    };
  }

  return {
    props: {
      cuisines,
      restaurants,
      user
    },
  };
};
