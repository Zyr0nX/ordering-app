import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from "~/components/ui/AdminCommonHeader";
import AdminRequestsBody from "~/components/ui/AdminRequestsBody";
import { getServerAuthSession } from "~/server/auth";

const Index: NextPage = () => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Requests" />
        <AdminRequestsBody />
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
