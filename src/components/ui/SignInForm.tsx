import FacebookIcon from "../icons/FacebookIcon";
import GoogleIcon from "../icons/GoogleIcon";
import TwitterIcon from "../icons/TwitterIcon";
import { signIn } from "next-auth/react";
import React from "react";

const SignInForm = () => {
  return (
    <div className="w-5/6 rounded-3xl bg-virparyasBackground p-5 text-virparyasMainBlue">
      <p className="text-center text-2xl font-bold">Sign In</p>
      <div className="mt-4 flex flex-col">
        <label htmlFor="email" className="font-medium">
          Email:
        </label>
        <input
          type="text"
          id="email"
          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
          placeholder="Email..."
        />
      </div>
      <button className="my-8 h-10 w-full rounded-xl bg-virparyasMainBlue font-bold text-white">
        Sign In
      </button>
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
