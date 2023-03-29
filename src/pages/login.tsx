import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import SignInForm from "~/components/ui/SignInForm";
import { getServerAuthSession } from "~/server/auth";

const SignIn: NextPage = () => {
  return (
    <Guest>
      <div className="from-viparyasDarkBlue/80 to-virparyasLightBrown/80 flex min-h-screen w-screen items-center justify-center bg-gradient-to-r">
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

  if (session?.user.role === "ADMIN") {
    return {
      redirect: {
        destination: "/manage/admin",
        permanent: false,
      },
    };
  }

  if (session?.user.role === "USER") {
    return {
      redirect: {
        destination: "/manage/user",
        permanent: false,
      },
    };
  }

  if (session?.user.role === "RESTAURANT") {
    return {
      redirect: {
        destination: "/manage/restaurant",
        permanent: false,
      },
    };
  }

  if (session?.user.role === "SHIPPER") {
    return {
      redirect: {
        destination: "/manage/shipper",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default SignIn;
