import { useRouter } from "next/router";
import React, { useState } from "react";
import { api } from "~/utils/api";

const Onboarding = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasPurple/80">
      <OnboardingForm />
    </div>
  );
};

const OnboardingForm: React.FC = () => {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [IsInvalidEmail, setIsInvalidEmail] = useState<boolean | null>(null);
  const [resent, setResent] = useState<boolean>(false);

  const router = useRouter();

  const createStripeConnectedAccount =
    api.stripe.createRestaurantConnectedAccount.useMutation();

  const handleOnboarding = async () => {
    const a = await createStripeConnectedAccount.mutateAsync();
    await router.push(a);
  };

  return (
    <div className="w-96 rounded-3xl bg-virparyasBackground p-5 text-virparyasMainBlue">
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
          onClick={() => void handleOnboarding()}
          className="my-8 h-10 w-full rounded-xl bg-virparyasMainBlue font-bold text-white"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
