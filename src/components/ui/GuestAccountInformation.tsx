import Loading from "../common/Loading";
import PlaceAutoCompleteCombobox from "../common/PlaceAutoCompleteCombobox";
import DropDownIcon from "../icons/DropDownIcon";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Listbox, Transition } from "@headlessui/react";
import { type User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";

const GuestAccountInformation = ({
  user,
  country,
}: {
  user: User;
  country: string;
}) => {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<PlaceAutocompleteResult>({
      description: user.address || "",
      place_id: user.addressId || "",
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
  const [additionalAddress, setAdditionalAddress] = useState(
    user.additionalAddress
  );
  const [phonePrefix, setPhonePrefix] = useState(
    countries.find((c) => c.isoCode === country)
  );
  const [phoneNumber, setPhoneNumber] = useState(
    !user.phoneNumber
      ? ""
      : user.phoneNumber.startsWith(phonePrefix?.dialCode || "")
      ? user.phoneNumber.slice(phonePrefix?.dialCode.length)
      : user.phoneNumber
  );

  const [isInvalidName, setIsInvalidName] = useState<boolean | null>(null);
  const [isInvalidAddress, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);

  const utils = api.useContext();

  const updateUserMutation = api.user.updateInfo.useMutation({
    onMutate: async (newUser) => {
      await utils.user.getInfomation.cancel();
      utils.user.getInfomation.setData(undefined, (old) => {
        if (old) {
          return {
            ...old,
            ...newUser,
          };
        }
        return old;
      });
    },
    onSettled: () => {
      void utils.user.getInfomation.invalidate();
    },
  });

  const handleUpdateUser = async () => {
    let isInvalidForm = true;

    if (!z.string().nonempty().safeParse(name).success) {
      setIsInvalidName(true);
      isInvalidForm = false;
    } else {
      setIsInvalidName(false);
    }

    if (
      !z.string().nonempty().safeParse(placeAutocomplete.description).success ||
      !z.string().nonempty().safeParse(placeAutocomplete.place_id).success
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

    if (!isInvalidForm) return;
    await updateUserMutation.mutateAsync({
      name: name,
      address: placeAutocomplete.description,
      addressId: placeAutocomplete.place_id,
      additionalAddress: additionalAddress,
      phoneNumber: `${
        phonePrefix?.dialCode ? `(${phonePrefix?.dialCode})` : ""
      }${phoneNumber}`,
    });
    void router.push("/");
  };

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

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  api.maps.getReverseGeocode.useQuery(
    {
      query: `${lat as number},${lng as number}`,
    },
    {
      enabled: !!lat && !!lng,
      onSuccess: (data) => {
        if (!data) return;
        setPlaceAutocomplete({
          description: data.formatted_address,
          place_id: data.place_id,
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
      },
      staleTime: Infinity,
    }
  );

  const handleCurrentAddress = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  return (
    <div className="text-virparyasMainBlue m-4 md:m-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="name" className="font-medium">
              * Name:
            </label>
            {isInvalidName && (
              <p className="text-virparyasRed text-xs">Name is required</p>
            )}
          </div>

          <input
            type="text"
            id="name"
            className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
              isInvalidName ? "ring-virparyasRed ring-2" : ""
            }`}
            placeholder="Name..."
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="address" className="font-medium">
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
          <button onClick={handleCurrentAddress}>
            Use your current address
          </button>
        </div>
        <div className="flex flex-col">
          <label htmlFor="additionalAddress" className="font-medium">
            Additional address:
          </label>
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
            <label htmlFor="phoneNumber" className="font-medium">
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
              placeholder="Phone..."
              value={
                phoneNumber.startsWith(phonePrefix?.dialCode || "")
                  ? phoneNumber.slice(phonePrefix?.dialCode.length)
                  : phoneNumber
              }
              onChange={(e) => formatPhoneNumber(e)}
            />
          </div>
        </div>
      </div>
      <div className="px-auto mt-4 flex w-full justify-center gap-4">
        {updateUserMutation.isLoading ? (
          <Loading />
        ) : (
          <>
            <button
              type="button"
              className="bg-virparyasRed w-36 rounded-xl px-10 py-2 font-medium text-white"
            >
              Discard
            </button>
            <button
              type="button"
              className="bg-virparyasGreen w-36 rounded-xl px-10 py-2 font-medium text-white"
              onClick={() => void handleUpdateUser()}
            >
              Confirm
            </button>
          </>
        )}
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex flex-col gap-2">
          <Link
            href="/account/restaurant-registration"
            className="text-center text-lg font-medium"
          >
            Add your restaurant
          </Link>
          <Link
            href="/account/shipper-registration"
            className="text-center text-lg font-medium"
          >
            Sign up to deliver
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestAccountInformation;
