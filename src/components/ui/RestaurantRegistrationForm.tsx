import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import { type RestaurantType } from "@prisma/client";
import React, { Fragment, useRef, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import { type CountryCodes } from "~/utils/types";

const RestaurantRegistrationForm = ({ country }: { country: CountryCodes }) => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const restaurantNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const additionAddresRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  const [validFirstName, setValidFirstName] = useState(false);
  const [validLastName, setValidLastName] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [validEmail, setValidEmail] = useState(false);
  const [validRestaurantName, setValidRestaurantName] = useState(false);
  const [validAddress, setValidAddress] = useState(false);
  const [validAdditionAddress, setValidAdditionAddress] = useState(false);
  const [validCategory, setValidCategory] = useState(false);

  const [phonePrefix, setPhonePrefix] = useState<string | null>(null);
  const [restaurantTypes, setRestaurantTypes] = useState<
    RestaurantType[] | null
  >(null);

  const [selected, setSelected] = useState<RestaurantType | undefined>(
    undefined
  );

  const registrationMutation = api.restaurant.registration.useMutation();

  api.external.phonePrefix.useQuery(country, {
    enabled: !!country,
    onSuccess: (data) => setPhonePrefix(data),
  });

  api.restaurantType.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setRestaurantTypes(data);
      setSelected(data[0]);
    },
  });

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard?")) {
      if (firstNameRef.current) firstNameRef.current.value = "";
      if (lastNameRef.current) lastNameRef.current.value = "";
      if (phoneRef.current) phoneRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      if (restaurantNameRef.current) restaurantNameRef.current.value = "";
      if (addressRef.current) addressRef.current.value = "";
      if (additionAddresRef.current) additionAddresRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = "";
    }
  };

  const handleConfirm = () => {
    let invalid = false;
    if (!z.string().safeParse(firstNameRef.current?.value).success) {
      invalid = true;
      setValidFirstName(false);
    } else {
      setValidFirstName(true);
    }

    if (!z.string().safeParse(lastNameRef.current?.value).success) {
      invalid = true;
      setValidLastName(false);
    } else {
      setValidLastName(true);
    }

    if (!z.string().regex(/^\d+$/).safeParse(phoneRef.current?.value).success) {
      invalid = true;
      setValidPhone(false);
    } else {
      setValidPhone(true);
    }

    if (!z.string().safeParse(emailRef.current?.value).success) {
      invalid = true;
      setValidEmail(false);
    } else {
      setValidEmail(true);
    }

    if (!z.string().safeParse(restaurantNameRef.current?.value).success) {
      invalid = true;
      setValidRestaurantName(false);
    } else {
      setValidRestaurantName(true);
    }

    if (!z.string().safeParse(addressRef.current?.value).success) {
      invalid = true;
      setValidAddress(false);
    } else {
      setValidAddress(true);
    }

    if (!z.string().safeParse(additionAddresRef.current?.value).success) {
      invalid = true;
      setValidAdditionAddress(false);
    } else {
      setValidAdditionAddress(true);
    }

    if (!z.string().safeParse(categoryRef.current?.value).success) {
      invalid = true;
      setValidCategory(false);
    } else {
      setValidCategory(true);
    }

    if (invalid) return;

    registrationMutation.mutate({
      name: restaurantNameRef.current?.value as string,
      address: addressRef.current?.value as string,
      additionaladdress: additionAddresRef.current?.value,
      firstname: firstNameRef.current?.value as string,
      lastname: lastNameRef.current?.value as string,
      phonenumber: `${phonePrefix || ""}${phoneRef.current?.value as string}`,
      email: emailRef.current?.value as string,
      restaurantTypeId: selected?.id,
    });
  };

  return (
    <div className="mx-4 mt-6 text-virparyasMainBlue">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label htmlFor="firstName" className="font-medium">
              * First name:
            </label>
            <input
              type="text"
              id="firstName"
              className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue `}
              //   ${
              //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
              //   }

              placeholder="First name..."
              ref={firstNameRef}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="lastName" className="font-medium">
              * Last name:
            </label>
            <input
              type="text"
              id="lastName"
              className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue `}
              //   ${
              //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
              //   }

              placeholder="Last name..."
              ref={lastNameRef}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="phone" className="font-medium">
            * Phone {phonePrefix}:
          </label>
          <input
            type="text"
            id="phone"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue `}
            //   ${
            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
            //   }

            placeholder="Phone..."
            ref={phoneRef}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="font-medium">
            * Email:
          </label>
          <input
            type="email"
            id="email"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue `}
            //   ${
            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
            //   }

            placeholder="Email..."
            ref={emailRef}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="restaurantName" className="font-medium">
            * Restaurant name:
          </label>
          <input
            type="text"
            id="restaurantName"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue `}
            //   ${
            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
            //   }

            placeholder="Restaurant name..."
            ref={restaurantNameRef}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="address" className="font-medium">
            * Address:
          </label>
          <input
            type="text"
            id="address"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue `}
            //   ${
            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
            //   }

            placeholder="Address..."
            ref={addressRef}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="additionalAddress" className="font-medium">
            Additional address:
          </label>
          <input
            type="text"
            id="additionalAddress"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue`}
            //   ${
            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
            //   }

            placeholder="Additional address..."
            ref={additionAddresRef}
          />
        </div>
        <Listbox value={selected} onChange={setSelected}>
          <div className="relative">
            <Listbox.Label className="font-medium">* Category:</Listbox.Label>
            <Listbox.Button className="relative h-10 w-full rounded-xl bg-white px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue">
              {/* relative h-full w-full rounded-lg bg-white text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm */}
              <span className="truncate">{selected?.name}</span>
              <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                <DropDownIcon />
              </span>
            </Listbox.Button>
            {restaurantTypes && (
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {restaurantTypes.map((restaurantType) => (
                    <Listbox.Option
                      key={restaurantType.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-amber-100 text-amber-900"
                            : "text-gray-900"
                        }`
                      }
                      value={restaurantType}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {restaurantType.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"></span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            )}
          </div>
        </Listbox>
        <div className="mt-4 flex gap-4">
          <button
            className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            className="h-10 w-full rounded-xl bg-virparyasLightBlue font-bold text-white"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegistrationForm;
