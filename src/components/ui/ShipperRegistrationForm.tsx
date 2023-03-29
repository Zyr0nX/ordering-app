import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";
import dates from "~/utils/dates.json";
import months from "~/utils/months.json";
import years from "~/utils/years.json";

interface RestaurantRegistrationFormProps {
  country: string;
}

const ShipperRegistrationForm: React.FC<RestaurantRegistrationFormProps> = ({
  country,
}) => {
  const router = useRouter();
  const session = useSession();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [selectedYear, setSelectedYear] = useState(years[30]);

  const [isInvalidFirstName, setIsInvalidFirstName] = useState<boolean | null>(
    null
  );
  const [isInvalidLastName, setIsInvalidLastName] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);
  const [isInvalidIdentificationNumber, setIsInvalidRestaurantName] = useState<
    boolean | null
  >(null);
  const [isInvalidLicensePlate, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidDateOfBirth, setIsInvalidDateOfBirth] = useState<
    boolean | null
  >(null);
  const [isUnder18YearsOld, setIsUnder18YearsOld] = useState<boolean | null>(
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

  const shipperRegistrationMutation = api.shipper.registration.useMutation();

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard your forms?")) {
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setIdentificationNumber("");
      setLicensePlate("");
    }
    void router.push("/");
  };

  const handleSendShipperRequest = () => {
    let isValidForm = true;

    if (!z.string().nonempty().safeParse(identificationNumber).success) {
      setIsInvalidRestaurantName(true);
      isValidForm = false;
    } else {
      setIsInvalidRestaurantName(false);
    }

    if (!z.string().nonempty().safeParse(licensePlate).success) {
      setIsInvalidAddress(true);
      isValidForm = false;
    } else {
      setIsInvalidAddress(false);
    }

    if (!z.string().nonempty().safeParse(phoneNumber).success) {
      setIsInvalidPhoneNumber(true);
      isValidForm = false;
    } else {
      setIsInvalidPhoneNumber(false);
    }

    if (!z.string().nonempty().safeParse(firstName).success) {
      setIsInvalidFirstName(true);
      isValidForm = false;
    } else {
      setIsInvalidFirstName(false);
    }

    if (!z.string().nonempty().safeParse(lastName).success) {
      setIsInvalidLastName(true);
      isValidForm = false;
    } else {
      setIsInvalidLastName(false);
    }

    const dateOfBirth = new Date(
      `${selectedMonth?.month as string} ${selectedDate?.date as string}, ${
        selectedYear?.year as string
      }`
    );

    if (!z.date().safeParse(dateOfBirth).success) {
      setIsInvalidDateOfBirth(true);
      isValidForm = false;
    } else {
      setIsInvalidDateOfBirth(false);
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      eighteenYearsAgo.setMonth(dateOfBirth.getMonth());
      eighteenYearsAgo.setDate(dateOfBirth.getDate());
      if (dateOfBirth <= eighteenYearsAgo) {
        setIsUnder18YearsOld(false);
      } else {
        setIsUnder18YearsOld(true);
        isValidForm = false;
      }
    }

    if (!isValidForm) return;

    shipperRegistrationMutation.mutate({
      firstName,
      lastName,
      phoneNumber: `${
        phonePrefix?.dialCode ? `(${phonePrefix.dialCode}) ` : ""
      }${phoneNumber}`,
      identificationNumber,
      licensePlate,
      dateOfBirth,
    });
  };

  return (
    <div className="text-virparyasMainBlue mx-4 mt-6">
      <div className="flex flex-col gap-2">
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
          <div className="inline-flex items-center justify-between">
            <label htmlFor="lastName" className="whitespace-nowrap font-medium">
              * Date of birth:
            </label>
            {isInvalidDateOfBirth && (
              <p className="text-virparyasRed text-xs">
                Date of birth is invalid
              </p>
            )}
            {isUnder18YearsOld && (
              <p className="text-virparyasRed text-xs">
                You have to be over 18 years old
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Listbox value={selectedDate} onChange={setSelectedDate}>
              {({ open }) => (
                <div className="relative">
                  <Listbox.Button
                    className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                      open
                        ? "ring-virparyasMainBlue ring-2"
                        : isInvalidDateOfBirth
                        ? "ring-virparyasRed ring-2"
                        : ""
                    }`}
                  >
                    <span className="truncate">{selectedDate?.date}</span>
                    <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                      <DropDownIcon />
                    </span>
                  </Listbox.Button>
                  {dates && (
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                        {dates.map((day) => (
                          <Listbox.Option
                            key={day.id}
                            className={({ active }) =>
                              `text-viparyasDarkBlue relative cursor-default select-none ${
                                active ? "bg-[#E9E9FF]" : "text-gray-900"
                              }`
                            }
                            value={day}
                          >
                            {({ selected }) => (
                              <span
                                className={`block truncate px-4 py-2 ${
                                  selected
                                    ? "bg-virparyasMainBlue font-semibold text-white"
                                    : ""
                                }`}
                              >
                                {day.date}
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
            <Listbox value={selectedMonth} onChange={setSelectedMonth}>
              {({ open }) => (
                <div className="relative">
                  <Listbox.Button
                    className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                      open
                        ? "ring-virparyasMainBlue ring-2"
                        : isInvalidDateOfBirth
                        ? "ring-virparyasRed ring-2"
                        : ""
                    }`}
                  >
                    <span className="truncate">{selectedMonth?.month}</span>
                    <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                      <DropDownIcon />
                    </span>
                  </Listbox.Button>
                  {months && (
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                        {months.map((month) => (
                          <Listbox.Option
                            key={month.id}
                            className={({ active }) =>
                              `text-viparyasDarkBlue relative cursor-default select-none ${
                                active ? "bg-[#E9E9FF]" : "text-gray-900"
                              }`
                            }
                            value={month}
                          >
                            {({ selected }) => (
                              <span
                                className={`block truncate px-4 py-2 ${
                                  selected
                                    ? "bg-virparyasMainBlue font-semibold text-white"
                                    : ""
                                }`}
                              >
                                {month.month}
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
            <Listbox value={selectedYear} onChange={setSelectedYear}>
              {({ open }) => (
                <div className="relative">
                  <Listbox.Button
                    className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                      open
                        ? "ring-virparyasMainBlue ring-2"
                        : isInvalidDateOfBirth || isUnder18YearsOld
                        ? "ring-virparyasRed ring-2"
                        : ""
                    }`}
                  >
                    <span className="truncate">{selectedYear?.year}</span>
                    <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                      <DropDownIcon />
                    </span>
                  </Listbox.Button>
                  {years && (
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                        {years.map((year) => (
                          <Listbox.Option
                            key={year.id}
                            className={({ active }) =>
                              `text-viparyasDarkBlue relative cursor-default select-none ${
                                active ? "bg-[#E9E9FF]" : "text-gray-900"
                              }`
                            }
                            value={year}
                          >
                            {({ selected }) => (
                              <span
                                className={`block truncate px-4 py-2 ${
                                  selected
                                    ? "bg-virparyasMainBlue font-semibold text-white"
                                    : ""
                                }`}
                              >
                                {year.year}
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
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor="identificationNumber"
              className="whitespace-nowrap font-medium"
            >
              * Identification number:
            </label>
            {isInvalidIdentificationNumber && (
              <p className="text-virparyasRed text-xs">
                Identification number is required
              </p>
            )}
          </div>

          <input
            type="text"
            id="identificationNumber"
            className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
              isInvalidIdentificationNumber ? "ring-virparyasRed ring-2" : ""
            }`}
            placeholder="Identification number..."
            value={identificationNumber || ""}
            onChange={(e) => setIdentificationNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label
              htmlFor="licensePlate"
              className="whitespace-nowrap font-medium"
            >
              * License plate:
            </label>
            {isInvalidLicensePlate && (
              <p className="text-virparyasRed text-xs">
                License plate is required
              </p>
            )}
          </div>

          <input
            type="text"
            id="licensePlate"
            className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
              isInvalidLicensePlate ? "ring-virparyasRed ring-2" : ""
            }`}
            placeholder="License plate..."
            value={licensePlate || ""}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
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
              value={
                phoneNumber.startsWith(phonePrefix?.dialCode || "")
                  ? phoneNumber.slice(phonePrefix?.dialCode.length)
                  : phoneNumber
              }
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
            onClick={handleSendShipperRequest}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipperRegistrationForm;
