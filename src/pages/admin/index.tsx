import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";
import Admin from "~/components/layouts/Admin";
import AdminBody from "~/components/ui/AdminBody";
import AdminHeader from "~/components/ui/AdminHeader";
import { getServerAuthSession } from "~/server/auth";

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

export const getServerSideProps = async (context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "ADMIN") {
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
