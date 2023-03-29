import { type GetServerSidePropsContext, type NextPage } from "next";
import Restaurant from "~/components/layouts/Restaurant";
import Shipper from "~/components/layouts/Shipper";
import RestaurantHomeBody from "~/components/ui/RestaurantHomeBody";
import RestaurantHomeHeader from "~/components/ui/RestaurantHomeHeader";
import ShipperHomeHeader from "~/components/ui/ShipperHomeHeader";
import { getServerAuthSession } from "~/server/auth";

const Index: NextPage = () => {
  return (
    <Shipper>
      <>
        <ShipperHomeHeader />
        <div className="relative -top-8 mx-4 md:-top-16 md:mx-20">
          <RestaurantHomeBody />
        </div>
      </>
    </Shipper>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "SHIPPER") {
    return {
      notFound: true,
    };
  }

  return {
    props: {},
  };
};

export default Index;
