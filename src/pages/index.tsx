import { type NextPage } from "next";
import { type InferGetServerSidePropsType } from "next";
import Guest from "~/components/layouts/Guest";
import HomeBody from "~/components/ui/HomeBody";
import HomeHeader from "~/components/ui/HomeHeader";
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

export const getServerSideProps = async () => {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      approved: "APPROVED",
    },
    select: {
      id: true,
      name: true,
      address: true,
      brandImage: true,
      restaurantType: {
        select: {
          name: true,
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
