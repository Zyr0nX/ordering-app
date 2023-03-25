import Loading from "../common/Loading";
import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import { type User } from "@prisma/client";
import Image from "next/image";
import React, { Fragment, useRef, useState } from "react";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";

const GuestAccountInformation = ({
  user,
  country,
}: {
  user: User | null;
  country: string;
}) => {
  const userQuery = api.user.getInfomation.useQuery(undefined, {
    initialData: user,
  });

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

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const additionalAddressRef = useRef<HTMLInputElement>(null);

  const handleUpdateUser = async () => {
    await updateUserMutation.mutateAsync({
      name: nameRef.current?.value || "",
      address: addressRef.current?.value || "",
      additionalAddress: additionalAddressRef.current?.value,
      phoneNumber: `${phonePrefix?.dialCode || ""}${
        phoneNumberRef.current?.value as string
      }`,
    });
  };
  return (
    <>
      <div className="m-4 flex flex-col gap-2 text-virparyasMainBlue">
        <div className="flex flex-col">
          <label htmlFor="name" className="font-medium">
            * Name:
          </label>
          <input
            type="text"
            className="h-10 w-full rounded-xl px-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
            placeholder="Name..."
            id="name"
            defaultValue={userQuery.data?.name || ""}
            ref={nameRef}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="phone" className="font-medium">
            * Phone:
          </label>
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
              type="number"
              id="phone"
              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
              //   ${
              //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
              //   }
              defaultValue={
                (userQuery.data?.phoneNumber?.startsWith(
                  phonePrefix?.dialCode || ""
                )
                  ? userQuery.data.phoneNumber.slice(
                      phonePrefix?.dialCode.length
                    )
                  : userQuery.data?.phoneNumber) || ""
              }
              placeholder="Phone..."
              ref={phoneNumberRef}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="font-medium">
            * Email:
          </label>
          <input
            type="email"
            className="h-10 w-full rounded-xl px-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
            placeholder="Email..."
            id="email"
            defaultValue={userQuery.data?.email || ""}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="address" className="font-medium">
            * Address:
          </label>
          <input
            type="text"
            className="h-10 w-full rounded-xl px-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
            placeholder="Address..."
            id="address"
            defaultValue={userQuery.data?.address || ""}
            ref={addressRef}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="address" className="font-medium">
            Additional address:
          </label>
          <input
            type="text"
            className="h-10 w-full rounded-xl px-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
            placeholder="Address..."
            id="address"
            defaultValue={userQuery.data?.additionalAddress || ""}
            ref={additionalAddressRef}
          />
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
    </>
  );
};

export default GuestAccountInformation;
