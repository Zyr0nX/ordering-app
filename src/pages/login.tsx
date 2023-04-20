import { Form, Formik } from "formik";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { z } from "zod";
import Input from "~/components/common/CommonInput";
import BackArrowIcon from "~/components/icons/BackArrowIcon";
import FacebookIcon from "~/components/icons/FacebookIcon";
import GoogleIcon from "~/components/icons/GoogleIcon";
import HomeIcon from "~/components/icons/HomeIcon";
import Guest from "~/components/layouts/Guest";
import { getServerAuthSession } from "~/server/auth";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
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

const SignIn: NextPage = () => {
  return (
    <Guest>
      <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80">
        <SignInForm />
      </div>
    </Guest>
  );
};

const SignInForm = () => {
  const [sent, setSent] = useState<boolean>(false);
  const [resent, setResent] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const router = useRouter();

  const handleBackButton = () => {
    if (sent) {
      setSent(false);
    } else {
      router.back();
    }
  };

  const handleResent = () => {
    void signIn("email", {
      redirect: false,
      email: email,
    });
    setResent(true);
  };

  return (
    <div className="w-96 rounded-3xl bg-virparyasBackground p-5 text-virparyasMainBlue">
      <div className="flex items-center justify-between">
        <button type="button" onClick={handleBackButton}>
          <BackArrowIcon className="h-5 w-5 fill-virparyasMainBlue" />
        </button>
        <p className="text-center text-2xl font-bold">Sign In</p>
        <Link href="/">
          <HomeIcon className="h-5 w-5 fill-virparyasMainBlue" />
        </Link>
      </div>

      {sent ? (
        <div className="min-h-48 text-center">
          <div className="mt-4">
            <p>A sign in link has been sent to</p>
            <p className="font-semibold">{email}</p>
          </div>
          <div className="py-4">
            <p className="text-xs font-light">
              Note: Sign in link automatically expires after 24 hours
            </p>
          </div>
          <div className="py-4">
            {!resent ? (
              <p className="text-sm">
                Didn&apos;t work?{" "}
                <button className="font-semibold" onClick={handleResent}>
                  Send me another sign in link
                </button>
              </p>
            ) : (
              <p className="text-sm">Link re-sent! Please check your email</p>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-48 mt-4">
          <div className="mt-4 flex flex-col">
            <Formik
              initialValues={{
                email: "",
              }}
              onSubmit={(values) => {
                void signIn("email", {
                  redirect: false,
                  email: values.email,
                });
                setEmail(values.email);
                setSent(true);
              }}
              validate={(values) => {
                const errors: {
                  email?: string;
                } = {};
                if (!z.string().email().safeParse(values.email).success) {
                  errors.email = "Email is invalid";
                }
                return errors;
              }}
            >
              <Form>
                <Input label="*Email" name="email" placeholder="Email..." />
                <button
                  type="submit"
                  className="my-8 h-10 w-full rounded-xl bg-virparyasMainBlue font-bold text-white"
                >
                  Sign In
                </button>
              </Form>
            </Formik>
          </div>
        </div>
      )}

      <div className="relative h-px w-full bg-virparyasMainBlue">
        <p className="ml-auto mr-auto w-fit -translate-y-1/2 bg-virparyasBackground px-2">
          or sign in using
        </p>
      </div>
      <div className="my-10 flex justify-center gap-6">
        <button onClick={() => void signIn("google")}>
          <GoogleIcon />
        </button>
        <button onClick={() => void signIn("facebook")}>
          <FacebookIcon />
        </button>
        {/* <button onClick={() => void signIn("twitter")}>
          <TwitterIcon />
        </button> */}
      </div>
    </div>
  );
};

export default SignIn;
