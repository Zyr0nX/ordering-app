import { signIn } from "next-auth/react";
import React from "react";
import Anchor from "../../common/Anchor";
import IconGoogle from "../../common/Icon/IconGoogle";

const SignIn = () => {
  return (
    <div className="flex h-full">
      <div className="m-auto box-border flex h-auto max-w-90 flex-col bg-white px-4 py-0">
        <div className="box-border flex h-full flex-col justify-between pt-4">
          <div className="flex grow flex-col">
            <h1 className="m-0 text-2xl font-normal leading-7.5 text-black">
              What&apos;s your phone number or email?
            </h1>
            <Anchor
              href=""
              backgroundColor="gray"
              Icon={<IconGoogle viewBox="0 0 256 262" className="h-5 w-5" />}
              name="Continue with Google"
              variant="large"
              onClick={() => {
                signIn("google");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
