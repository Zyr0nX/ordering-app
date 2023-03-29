import PlaceAutoCompleteCombobox from "../common/PlaceAutoCompleteCombobox";
import DropDownIcon from "../icons/DropDownIcon";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Listbox, Transition } from "@headlessui/react";
import { type Cuisine } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";

interface RestaurantRegistrationFormProps {
  country: string;
  cuisines: Cuisine[];
}

const RestaurantRegistrationForm: React.FC<RestaurantRegistrationFormProps> = ({
  country,
  cuisines,
}) => {
  const router = useRouter();
  const session = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<PlaceAutocompleteResult>({
      description: "",
      place_id: "",
      terms: [],
      types: [],
      matched_substrings: [],
      structured_formatting: {
        main_text: "",
        main_text_matched_substrings: [],
        secondary_text: "",
        secondary_text_matched_substrings: [],
      },
    });
  const [additionalAddress, setAdditionalAddress] = useState("");
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);

  const [isInvalidFirstName, setIsInvalidFirstName] = useState<boolean | null>(
    null
  );
  const [isInvalidLastName, setIsInvalidLastName] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);
  const [isInvalidRestaurantName, setIsInvalidRestaurantName] = useState<
    boolean | null
  >(null);
  const [isInvalidAddress, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidCuisine, setIsInvalidCuisine] = useState<boolean | null>(
    null
  );

  const [phonePrefix, setPhonePrefix] = useState(
    countries.find((c) => c.isoCode === country)
  );

  const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Only allow digits
    const newValue = value.replace(/\D/g, "");

    // Format the phone number
    const formattedValue = newValue.replace(
      /(\d{3})(\d{3})(\d{3})/,
      "$1-$2-$3"
    );
    setPhoneNumber(formattedValue);
  };

  const restaurantRegistrationMutation =
    api.restaurant.registration.useMutation();

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard your forms?")) {
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setRestaurantName("");
      setPlaceAutocomplete({
        description: "",
        place_id: "",
        terms: [],
        types: [],
        matched_substrings: [],
        structured_formatting: {
          main_text: "",
          main_text_matched_substrings: [],
          secondary_text: "",
          secondary_text_matched_substrings: [],
        },
      });
      setAdditionalAddress("");
      setCuisine(null);
    }
    void router.push("/");
  };

  const handleSendRegistrationRequest = () => {
    let isInvalidForm = true;

    if (!z.string().nonempty().safeParse(restaurantName).success) {
      setIsInvalidRestaurantName(true);
      isInvalidForm = false;
    } else {
      setIsInvalidRestaurantName(false);
    }

    if (
      !z.string().nonempty().safeParse(placeAutocomplete?.place_id).success &&
      !z.string().nonempty().safeParse(placeAutocomplete?.description).success
    ) {
      setIsInvalidAddress(true);
      isInvalidForm = false;
    } else {
      setIsInvalidAddress(false);
    }

    if (!z.string().nonempty().safeParse(phoneNumber).success) {
      setIsInvalidPhoneNumber(true);
      isInvalidForm = false;
    } else {
      setIsInvalidPhoneNumber(false);
    }

    if (!z.string().cuid().nonempty().safeParse(cuisine?.id).success) {
      setIsInvalidCuisine(true);
      isInvalidForm = false;
    } else {
      setIsInvalidCuisine(false);
    }

    if (!z.string().nonempty().safeParse(firstName).success) {
      setIsInvalidFirstName(true);
      isInvalidForm = false;
    } else {
      setIsInvalidFirstName(false);
    }

    if (!z.string().nonempty().safeParse(lastName).success) {
      setIsInvalidLastName(true);
      isInvalidForm = false;
    } else {
      setIsInvalidLastName(false);
    }

    if (!isInvalidForm) return;
    restaurantRegistrationMutation.mutate({
      restaurantName,
      address: placeAutocomplete.description,
      addressId: placeAutocomplete.place_id,
      additionalAddress,
      firstName,
      lastName,
      cuisineId: cuisine?.id as string,
      phoneNumber: `${
        phonePrefix?.dialCode ? `(${phonePrefix.dialCode}) ` : ""
      }${phoneNumber}`,
    });
  };

  return (
    <div className="text-virparyasMainBlue mx-4 mt-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor="restaurantName"
              className="whitespace-nowrap font-medium"
            >
              * Restaurant name:
            </label>
            {isInvalidRestaurantName && (
              <p className="text-virparyasRed text-xs">
                Restaurant name is required
              </p>
            )}
          </div>

          <input
            type="text"
            id="restaurantName"
            className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
              isInvalidRestaurantName ? "ring-virparyasRed ring-2" : ""
            }`}
            placeholder="Restaurant name..."
            value={restaurantName || ""}
            onChange={(e) => setRestaurantName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="address" className="whitespace-nowrap font-medium">
              * Address:
            </label>
            {isInvalidAddress && (
              <p className="text-virparyasRed text-xs">Address is required</p>
            )}
          </div>
          <PlaceAutoCompleteCombobox
            placeAutocomplete={placeAutocomplete}
            setPlaceAutocomplete={setPlaceAutocomplete}
            isInvalidAddress={isInvalidAddress}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor="additionalAddress"
              className="whitespace-nowrap font-medium"
            >
              Additional Address:
            </label>
          </div>

          <input
            type="text"
            id="additionalAddress"
            className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
            placeholder="Additional address..."
            value={additionalAddress || ""}
            onChange={(e) => setAdditionalAddress(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="cuisine" className="whitespace-nowrap font-medium">
              * Cuisine:
            </label>
            {isInvalidCuisine && (
              <p className="text-virparyasRed text-xs">Cuisine is required</p>
            )}
          </div>

          <Listbox value={cuisine} onChange={setCuisine}>
            {({ open }) => (
              <div className="relative">
                <Listbox.Button
                  className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                    open
                      ? "ring-virparyasMainBlue ring-2"
                      : isInvalidCuisine
                      ? "ring-virparyasRed ring-2"
                      : ""
                  }`}
                >
                  <span className="truncate">
                    {cuisine?.name || "Select a cuisine"}
                  </span>
                  <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                    <DropDownIcon />
                  </span>
                </Listbox.Button>
                {cuisines && (
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                      {cuisines.map((cuisine) => (
                        <Listbox.Option
                          key={cuisine.id}
                          className={({ active }) =>
                            `text-viparyasDarkBlue relative cursor-default select-none ${
                              active ? "bg-[#E9E9FF]" : "text-gray-900"
                            }`
                          }
                          value={cuisine}
                        >
                          {({ selected }) => (
                            <span
                              className={`block truncate px-4 py-2 ${
                                selected
                                  ? "bg-virparyasMainBlue font-semibold text-white"
                                  : ""
                              }`}
                            >
                              {cuisine.name}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                )}
              </div>
            )}
          </Listbox>
        </div>
        <div className="flex gap-4">
          <div className="flex grow flex-col">
            <div className="flex items-center justify-between">
              <label
                htmlFor="firstName"
                className="whitespace-nowrap font-medium"
              >
                * First name:
              </label>
              {isInvalidFirstName && (
                <p className="text-virparyasRed text-xs">
                  First name is required
                </p>
              )}
            </div>

            <input
              type="text"
              id="firstName"
              className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                isInvalidFirstName ? "ring-virparyasRed ring-2" : ""
              }`}
              placeholder="First name..."
              value={firstName || ""}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="flex grow flex-col">
            <div className="inline-flex items-center justify-between">
              <label
                htmlFor="lastName"
                className="whitespace-nowrap font-medium"
              >
                * Last name:
              </label>
              {isInvalidLastName && (
                <p className="text-virparyasRed text-xs">
                  Last name is required
                </p>
              )}
            </div>

            <input
              type="text"
              id="lastName"
              className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                isInvalidLastName ? "ring-virparyasRed ring-2" : ""
              }`}
              placeholder="Last name..."
              value={lastName || ""}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor="phoneNumber"
              className="whitespace-nowrap font-medium"
            >
              * Phone number:
            </label>
            {isInvalidPhoneNumber && (
              <p className="text-virparyasRed text-xs">
                Phone number is required
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {phonePrefix && (
              <Listbox value={phonePrefix} onChange={setPhonePrefix}>
                {({ open }) => (
                  <div className="relative w-24 shrink-0">
                    <Listbox.Button
                      className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                        open ? "ring-virparyasMainBlue ring-2" : ""
                      }`}
                    >
                      <span className="truncate">{phonePrefix?.dialCode}</span>
                      <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                        <DropDownIcon />
                      </span>
                    </Listbox.Button>
                    {countries && (
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                          {countries.map((country) => (
                            <Listbox.Option
                              key={country.name}
                              className={({ active }) =>
                                `text-viparyasDarkBlue relative cursor-default select-none ${
                                  active ? "bg-[#E9E9FF]" : "text-gray-900"
                                }`
                              }
                              value={country}
                            >
                              {({ selected }) => (
                                <span
                                  className={`flex gap-2 truncate px-4 py-2 ${
                                    selected
                                      ? "bg-virparyasMainBlue font-semibold text-white"
                                      : ""
                                  }`}
                                >
                                  <Image
                                    src={country.flag}
                                    width={20}
                                    height={10}
                                    alt="flag"
                                  ></Image>
                                  {country.dialCode}
                                </span>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    )}
                  </div>
                )}
              </Listbox>
            )}
            <input
              type="text"
              id="phoneNumber"
              className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                isInvalidPhoneNumber ? "ring-virparyasRed ring-2" : ""
              }`}
              placeholder="Phone number..."
              value={phoneNumber}
              onChange={(e) => formatPhoneNumber(e)}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="whitespace-nowrap font-medium">
            Email:
          </label>

          <input
            type="email"
            id="email"
            className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
            disabled
            value={session.data?.user.email || ""}
          />
        </div>
        <div className="mt-4 flex gap-4">
          <button
            className="bg-virparyasRed h-10 w-full rounded-xl font-bold text-white"
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            className="bg-virparyasLightBlue h-10 w-full rounded-xl font-bold text-white"
            onClick={handleSendRegistrationRequest}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegistrationForm;
