import BackArrowIcon from "../icons/BackArrowIcon";
import FacebookIcon from "../icons/FacebookIcon";
import GoogleIcon from "../icons/GoogleIcon";
import HomeIcon from "../icons/HomeIcon";
import TwitterIcon from "../icons/TwitterIcon";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { z } from "zod";

const SignInForm = () => {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [IsInvalidEmail, setIsInvalidEmail] = useState<boolean | null>(null);
  const [resent, setResent] = useState<boolean>(false);

  const router = useRouter();

  const handleBackButton = () => {
    if (IsInvalidEmail) {
      router.back();
    } else {
      setIsInvalidEmail(null);
    }
  };

  const handleSignInWithEmail = () => {
    if (z.string().email().safeParse(email).success) {
      void signIn("email", {
        redirect: false,
        email: email,
      });
      setIsInvalidEmail(false);
    } else {
      setIsInvalidEmail(true);
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

      {IsInvalidEmail === false ? (
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
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <label htmlFor="address" className="font-medium">
                  * Email:
                </label>
                {IsInvalidEmail && (
                  <p className="text-xs text-virparyasRed">Email is invalid</p>
                )}
              </div>

              <input
                type="text"
                id="address"
                className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                  IsInvalidEmail ? "ring-2 ring-virparyasRed" : ""
                }`}
                placeholder="Email..."
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
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
        <button onClick={() => void signIn("twitter")}>
          <TwitterIcon />
        </button>
      </div>
    </div>
  );
};

export default SignInForm;
