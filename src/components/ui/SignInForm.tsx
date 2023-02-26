import BackArrowIcon from "../icons/BackArrowIcon";
import FacebookIcon from "../icons/FacebookIcon";
import GoogleIcon from "../icons/GoogleIcon";
import TwitterIcon from "../icons/TwitterIcon";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { z } from "zod";

const SignInForm = () => {
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  const router = useRouter();

  const handleBackButton = () => {
    if (emailSent) {
      setEmailSent(false);
    } else {
      router.back();
    }
  };

  const handleSignInWithEmail = () => {
    setEmail(emailRef.current?.value);
    if (z.string().email().safeParse(email).success) {
      void signIn("email", {
        redirect: false,
        email: email,
      });

      setEmailSent(true);
    } else {
      setEmailSent(false);
    }
  };

  const handleResent = () => {
    void signIn("email", {
      redirect: false,
      email: email,
    });
  };

  return (
    <div className="relative w-5/6 rounded-3xl bg-virparyasBackground p-5 text-virparyasMainBlue">
      <button type="button" className="absolute" onClick={handleBackButton}>
        <BackArrowIcon />
      </button>
      <p className="text-center text-2xl font-bold">Sign In</p>
      {emailSent ? (
        <div className="h-[184px] text-center">
          <div className="mt-4">
            <p>A sign in link has been sent to</p>
            <p className="font-semibold">{email}</p>
          </div>
          <div className="py-4">
            <p className="text-xs font-light">
              Note: Sign in link automatically expires after 10 minutes
            </p>
          </div>
          <div className="py-4">
            <p className="text-sm">
              Didn&apos;t work?{" "}
              <button className="font-semibold" onClick={handleResent}>
                Send me another sign in link
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 h-[184px]">
          <div className="mt-4 flex flex-col">
            <label htmlFor="email" className="font-medium">
              Email: {emailSent ? "valid" : "invalid"}
            </label>
            <input
              type="text"
              id="email"
              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
              placeholder="Email..."
              ref={emailRef}
            />
          </div>
          <button
            onClick={handleSignInWithEmail}
            className="my-8 h-10 w-full rounded-xl bg-virparyasMainBlue font-bold text-white"
          >
            Sign In
          </button>
        </div>
      )}

      <div className="relative h-px w-full bg-virparyasMainBlue">
        <p className="ml-auto mr-auto w-fit -translate-y-1/2 bg-virparyasBackground p-2">
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
        <button onClick={() => void signIn("twitter")}>
          <TwitterIcon />
        </button>
      </div>
    </div>
  );
};

export default SignInForm;
