import Loading from "../common/Loading";
import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import { type User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
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
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address);
  const [additionalAddress, setAdditionalAddress] = useState(
    user.additionalAddress
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isInvalidName, setIsInvalidName] = useState<boolean | null>(null);
  const [isInvalidAddress, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);

  const [phonePrefix, setPhonePrefix] = useState(
    countries.find((c) => c.isoCode === country)
  );

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

    if (!z.string().nonempty().safeParse(address).success) {
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
      address: address,
      additionalAddress: additionalAddress,
      phoneNumber: `${
        phonePrefix?.dialCode ? `(${phonePrefix?.dialCode})` : ""
      }${phoneNumber}`,
    });
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
  return (
    <div className="m-4 text-virparyasMainBlue md:m-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="name" className="font-medium">
              * Name:
            </label>
            {isInvalidName && (
              <p className="text-xs text-virparyasRed">Name is required</p>
            )}
          </div>

          <input
            type="text"
            id="name"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
              isInvalidName ? "ring-2 ring-virparyasRed" : ""
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
              <p className="text-xs text-virparyasRed">Address is required</p>
            )}
          </div>

          <input
            type="text"
            id="address"
            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
              isInvalidAddress ? "ring-2 ring-virparyasRed" : ""
            }`}
            placeholder="Address..."
            value={address || ""}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="additionalAddress" className="font-medium">
            Additional address:
          </label>
          <input
            type="text"
            id="additionalAddress"
            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
              <p className="text-xs text-virparyasRed">
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
                        open ? "ring-2 ring-virparyasMainBlue" : ""
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
                                `relative cursor-default select-none text-viparyasDarkBlue ${
                                  active ? "bg-[#E9E9FF]" : "text-gray-900"
                                }`
                              }
                              value={country}
                            >
                              {({ selected }) => (
                                <span
                                  className={`flex gap-2 truncate py-2 px-4 ${
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
              className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                isInvalidPhoneNumber ? "ring-2 ring-virparyasRed" : ""
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
              className="w-36 rounded-xl bg-virparyasRed py-2 px-10 font-medium text-white"
            >
              Discard
            </button>
            <button
              type="button"
              className="w-36 rounded-xl bg-virparyasGreen py-2 px-10 font-medium text-white"
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
