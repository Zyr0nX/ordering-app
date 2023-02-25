import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import SignInForm from "~/components/ui/SignInForm";
import { getServerAuthSession } from "~/server/auth";

const Index: NextPage = () => {
  return (
    <Guest>
      <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80">
        <SignInForm />
      </div>
    </Guest>
  );
};

export const getServerSideProps = async (context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const session = await getServerAuthSession(context);

  if (session) {
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
