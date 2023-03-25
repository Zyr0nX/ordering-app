import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestAccountInformation from "~/components/ui/GuestAccountInformation";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Information: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user, country }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Account Information" />
        <GuestAccountInformation user={user} country={country} />
      </>
    </Guest>
  );
};

export default Information;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
const { country } = context.query;

  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id || "",
    },
  });

  return {
    props: {
      user,
      country: country as string
    },
  };
};
