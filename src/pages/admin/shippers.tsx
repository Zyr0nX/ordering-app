import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
} from "next";
import React from "react";
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from "~/components/ui/AdminCommonHeader";
import AdminShippersBody from "~/components/ui/AdminShippersBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Shippers = ({
  shippers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Shipper" />
        <AdminShippersBody shippers={shippers} />
      </>
    </Admin>
  );
};

export default Shippers;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "ADMIN") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const shippers = await prisma.shipper.findMany({
    where: {
      approved: "APPROVED",
    },
    include: {
      user: true,
    },
  });

  return {
    props: {
      shippers,
    },
  };
};
