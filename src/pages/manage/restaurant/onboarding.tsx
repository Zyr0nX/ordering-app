import { useRouter } from "next/router";
import React, { useState } from "react";
import { api } from "~/utils/api";


const Onboarding = () => {
  return (
    <div className="from-viparyasDarkBlue/80 to-virparyasPurple/80 flex h-screen w-screen items-center justify-center bg-gradient-to-r">
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
    <div className="bg-virparyasBackground text-virparyasMainBlue w-96 rounded-3xl p-5">
      <div className="min-h-48 mt-4">
        <div className="mt-4 flex flex-col">
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <label htmlFor="address" className="font-medium">
                * Email:
              </label>
              {IsInvalidEmail && (
                <p className="text-virparyasRed text-xs">Email is invalid</p>
              )}
            </div>

            <input
              type="text"
              id="address"
              className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                IsInvalidEmail ? "ring-virparyasRed ring-2" : ""
              }`}
              placeholder="Email..."
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => void handleOnboarding()}
          className="bg-virparyasMainBlue my-8 h-10 w-full rounded-xl font-bold text-white"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Onboarding;