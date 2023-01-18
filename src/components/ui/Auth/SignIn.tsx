import { signIn } from "next-auth/react";
import React, { useRef, useState } from "react";
import { z } from "zod";

import Button from "../../common/FormElement/Button";
import Textbox from "../../common/FormElement/Textbox";
import IconGoogle from "../../common/Icon/IconGoogle";

const SignIn = () => {
  const email = useRef<HTMLInputElement>(null);

  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);

  const signInWithEmail = () => {
    try {
      z.string().email().parse(email.current?.value);
      signIn("email", {
        redirect: false,
        email: email.current?.value,
      });
      setIsValidEmail(true);
    } catch (error) {
      setIsValidEmail(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="m-auto box-border flex h-auto w-80 flex-col bg-white px-4 py-0">
        <div className="box-border flex h-full flex-col justify-between pt-4">
          {isValidEmail ? (
            <div className="flex grow flex-col">
              <h1 className="text-2xl font-semibold leading-7.5 text-green-500">
                Email sent successfully, please check your email to login
              </h1>
            </div>
          ) : (
            <div className="flex grow flex-col">
              <h1 className="m-0 text-2xl font-normal leading-7.5 text-black">
                What&apos;s your email?
              </h1>
              <div className="h-2"></div>
              <div className="flex shrink-0 grow basis-auto flex-col">
                <div className="flex flex-row items-center leading-6">
                  <Textbox placeholder="Email address" ref={email} />
                </div>
                {isValidEmail != null && !isValidEmail && (
                  <p className="pt-2 text-xs leading-4 text-red-500">
                    The email you entered is invalid.
                  </p>
                )}
              </div>
              <div className="h-4"></div>
              <Button
                type="button"
                backgroundColor="black"
                name="Continue"
                onClick={signInWithEmail}
              />

              <div className="h-4"></div>
              <div>
                <div className="flex items-center py-1 text-neutral-400 before:h-px before:grow before:text-neutral-400 after:h-px after:grow after:text-neutral-400">
                  <div className="mx-2 text-sm leading-4">or</div>
                </div>
                <div className="h-4"></div>
                <Button
                  type="button"
                  backgroundColor="gray"
                  Icon={
                    <IconGoogle viewBox="0 0 256 262" className="h-5 w-5" />
                  }
                  name="Continue with Google"
                  onClick={() => {
                    signIn("google");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
