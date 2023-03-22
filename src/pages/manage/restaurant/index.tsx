import { type GetServerSidePropsContext, type NextPage } from "next";
import Restaurant from "~/components/layouts/Restaurant";
import RestaurantHomeBody from "~/components/ui/RestaurantHomeBody";
import RestaurnatHomeHeader from "~/components/ui/RestaurantHomeHeader";
import { getServerAuthSession } from "~/server/auth";

const Index: NextPage = () => {
  return (
    <Restaurant>
      <>
        <RestaurnatHomeHeader />
        <div className="relative -top-8 mx-4 md:-top-16 md:mx-20">
          <RestaurantHomeBody />
        </div>
      </>
    </Restaurant>
  );
};

export const getServerSideProps = async (context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "RESTAURANT") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default Index;
