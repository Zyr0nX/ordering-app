import BluePencil from "../icons/BluePencil";
import CloudIcon from "../icons/CloudIcon";
import DropDownIcon from "../icons/DropDownIcon";
import RedCross from "../icons/RedCross";
import Loading from "./Loading";
import { Transition, Dialog, Listbox } from "@headlessui/react";
import { type User, type Shipper } from "@prisma/client";
import Image from "next/image";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import dates from "~/utils/dates.json";
import months from "~/utils/months.json";
import useBase64 from "~/utils/useBase64";
import years from "~/utils/years.json";

interface ShipperAdminCardProps {
  shipper: Shipper & {
    user: User;
  };
  shipperList: (Shipper & {
    user: User;
  })[];
  setShipperList: React.Dispatch<
    React.SetStateAction<
      (Shipper & {
        user: User;
      })[]
    >
  >;
}

const ShipperAdminCard: React.FC<ShipperAdminCardProps> = ({
  shipper,
  shipperList,
  setShipperList,
}) => {
  const utils = api.useContext();

  const [firstName, setFirstName] = useState(shipper.firstName);
  const [lastName, setLastName] = useState(shipper.lastName);
  const [selectedDate, setSelectedDate] = useState(
    dates.find(
      ({ date }) =>
        date === shipper.dateOfBirth.toLocaleString("en-US", { day: "numeric" })
    )
  );
  const [selectedMonth, setSelectedMonth] = useState(
    months.find(
      ({ month }) =>
        month ===
        shipper.dateOfBirth.toLocaleString("en-US", { month: "short" })
    )
  );
  const [selectedYear, setSelectedYear] = useState(
    years.find(
      ({ year }) =>
        year ===
        shipper.dateOfBirth.toLocaleString("en-US", { year: "numeric" })
    )
  );
  const [identificationNumber, setIdentificationNumber] = useState(
    shipper.identificationNumber
  );
  const [licensePlate, setLicensePlate] = useState(shipper.licensePlate);
  const [phoneNumber, setPhoneNumber] = useState(shipper.phoneNumber);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [reason, setReason] = useState("");

  const { result: base64Image } = useBase64(imageFile);

  const [isInvalidFirstName, setIsInvalidFirstName] = useState<boolean | null>(
    null
  );
  const [isInvalidLastName, setIsInvalidLastName] = useState<boolean | null>(
    null
  );
  const [isInvalidDateOfBirth, setIsInvalidDateOfBirth] = useState<
    boolean | null
  >(null);
  const [isInvalidIdentificationNumber, setIsInvalidIdentificationNumber] =
    useState<boolean | null>(null);
  const [isInvalidLicensePlate, setIsInvalidLicensePlate] = useState<
    boolean | null
  >(null);
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);
  const [isInvalidImage, setIsInvalidImage] = useState<boolean | null>(null);
  const [isUnder18YearsOld, setIsUnder18YearsOld] = useState<boolean | null>(
    null
  );

  const [isInvalidReason, setIsInvalidReason] = useState<boolean | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const editShipperMutation = api.admin.editShipper.useMutation({
    onSuccess: (data) => {
      const newShipperList = shipperList.map((shipper) => {
        if (shipper.id === data.id) {
          return {
            ...shipper,
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: data.dateOfBirth,
            identificationNumber: data.identificationNumber,
            licensePlate: data.licensePlate,
            phoneNumber: data.phoneNumber,
            image: data.image,
          };
        } else {
          return shipper;
        }
      });
      setShipperList(newShipperList);
    },
    onSettled: () => {
      void utils.admin.getApprovedShippers.invalidate();
    },
  });

  const cloudinaryUploadMutation = api.cloudinary.upload.useMutation();

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleEditRestaurant = async () => {
    let isValidForm = true;

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

    if (!z.string().nonempty().safeParse(identificationNumber).success) {
      setIsInvalidIdentificationNumber(true);
      isValidForm = false;
    } else {
      setIsInvalidIdentificationNumber(false);
    }

    if (!z.string().nonempty().safeParse(phoneNumber).success) {
      setIsInvalidPhoneNumber(true);
      isValidForm = false;
    } else {
      setIsInvalidPhoneNumber(false);
    }

    if (
      !z.string().url().safeParse(base64Image).success &&
      !z.string().url().safeParse(shipper.image).success
    ) {
      setIsInvalidImage(true);
      isValidForm = false;
    } else {
      setIsInvalidImage(false);
    }

    if (!isValidForm) return;

    if (z.string().url().safeParse(base64Image).success) {
      const secure_url = await cloudinaryUploadMutation.mutateAsync({
        file: base64Image as string,
      });
      await editShipperMutation.mutateAsync({
        shipperId: shipper.id,
        firstName,
        lastName,
        dateOfBirth,
        identificationNumber,
        licensePlate,
        phoneNumber,
        image: secure_url,
      });
    } else {
      await editShipperMutation.mutateAsync({
        shipperId: shipper.id,
        firstName,
        lastName,
        dateOfBirth,
        identificationNumber,
        licensePlate,
        phoneNumber,
      });
    }
    setImageFile(null);
    setIsEditOpen(false);
  };

  const disableShipperMutation = api.admin.disableShipper.useMutation();

  const handleDisable = async () => {
    let isValidForm = true;
    if (!z.string().nonempty().safeParse(reason).success) {
      setIsInvalidReason(true);
      isValidForm = false;
    } else {
      setIsInvalidReason(false);
    }
    if (!isValidForm) return;
    await disableShipperMutation.mutateAsync({
      shipperId: shipper.id,
      reason,
    });
    setIsRejectOpen(false);
  };

  const handleDiscard = () => {
    setFirstName(shipper.firstName);
    setLastName(shipper.lastName);
    setPhoneNumber(shipper.phoneNumber);
    setLicensePlate(shipper.licensePlate);
    setIdentificationNumber(shipper.identificationNumber);
    setImageFile(null);
    setIsInvalidFirstName(null);
    setIsInvalidLastName(null);
    setIsInvalidPhoneNumber(null);
    setIsInvalidLicensePlate(null);
    setIsInvalidIdentificationNumber(null);
    setIsInvalidImage(null);
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {shipper.firstName} {shipper.lastName}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {shipper.phoneNumber}
            </p>
          </div>
          <div className="flex">
            <button
              type="button"
              className="relative z-10 mr-2"
              onClick={() => setIsEditOpen(true)}
            >
              <BluePencil className="md:h-10 md:w-10" />
            </button>
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsRejectOpen(true)}
            >
              <RedCross className="md:h-10 md:w-10" />
            </button>
          </div>
        </div>
      </div>
      <Transition appear show={isEditOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsEditOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit {shipper.firstName} {shipper.lastName}
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
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
                              <p className="text-xs text-virparyasRed">
                                First name is required
                              </p>
                            )}
                          </div>

                          <input
                            type="text"
                            id="firstName"
                            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                              isInvalidFirstName
                                ? "ring-2 ring-virparyasRed"
                                : ""
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
                              <p className="text-xs text-virparyasRed">
                                Last name is required
                              </p>
                            )}
                          </div>

                          <input
                            type="text"
                            id="lastName"
                            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                              isInvalidLastName
                                ? "ring-2 ring-virparyasRed"
                                : ""
                            }`}
                            placeholder="Last name..."
                            value={lastName || ""}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="inline-flex items-center justify-between">
                          <label
                            htmlFor="lastName"
                            className="whitespace-nowrap font-medium"
                          >
                            * Date of birth:
                          </label>
                          {isInvalidDateOfBirth && (
                            <p className="text-xs text-virparyasRed">
                              Date of birth is invalid
                            </p>
                          )}
                          {isUnder18YearsOld && (
                            <p className="text-xs text-virparyasRed">
                              You have to be over 18 years old
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Listbox
                            value={selectedDate}
                            onChange={setSelectedDate}
                          >
                            {({ open }) => (
                              <div className="relative">
                                <Listbox.Button
                                  className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                                    open
                                      ? "ring-2 ring-virparyasMainBlue"
                                      : isInvalidDateOfBirth
                                      ? "ring-2 ring-virparyasRed"
                                      : ""
                                  }`}
                                >
                                  <span className="truncate">
                                    {selectedDate?.date}
                                  </span>
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
                                            `relative cursor-default select-none text-viparyasDarkBlue ${
                                              active
                                                ? "bg-[#E9E9FF]"
                                                : "text-gray-900"
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
                          <Listbox
                            value={selectedMonth}
                            onChange={setSelectedMonth}
                          >
                            {({ open }) => (
                              <div className="relative">
                                <Listbox.Button
                                  className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                                    open
                                      ? "ring-2 ring-virparyasMainBlue"
                                      : isInvalidDateOfBirth
                                      ? "ring-2 ring-virparyasRed"
                                      : ""
                                  }`}
                                >
                                  <span className="truncate">
                                    {selectedMonth?.month}
                                  </span>
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
                                            `relative cursor-default select-none text-viparyasDarkBlue ${
                                              active
                                                ? "bg-[#E9E9FF]"
                                                : "text-gray-900"
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
                          <Listbox
                            value={selectedYear}
                            onChange={setSelectedYear}
                          >
                            {({ open }) => (
                              <div className="relative">
                                <Listbox.Button
                                  className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                                    open
                                      ? "ring-2 ring-virparyasMainBlue"
                                      : isInvalidDateOfBirth ||
                                        isUnder18YearsOld
                                      ? "ring-2 ring-virparyasRed"
                                      : ""
                                  }`}
                                >
                                  <span className="truncate">
                                    {selectedYear?.year}
                                  </span>
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
                                            `relative cursor-default select-none text-viparyasDarkBlue ${
                                              active
                                                ? "bg-[#E9E9FF]"
                                                : "text-gray-900"
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
                            <p className="text-xs text-virparyasRed">
                              Identification number is required
                            </p>
                          )}
                        </div>

                        <input
                          type="text"
                          id="identificationNumber"
                          className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                            isInvalidIdentificationNumber
                              ? "ring-2 ring-virparyasRed"
                              : ""
                          }`}
                          placeholder="Identification number..."
                          value={identificationNumber || ""}
                          onChange={(e) =>
                            setIdentificationNumber(e.target.value)
                          }
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
                            <p className="text-xs text-virparyasRed">
                              License plate is required
                            </p>
                          )}
                        </div>

                        <input
                          type="text"
                          id="licensePlate"
                          className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                            isInvalidLicensePlate
                              ? "ring-2 ring-virparyasRed"
                              : ""
                          }`}
                          placeholder="License plate..."
                          value={licensePlate || ""}
                          onChange={(e) => setLicensePlate(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="licensePlate"
                            className="whitespace-nowrap font-medium"
                          >
                            * Phone number:
                          </label>
                          {isInvalidPhoneNumber && (
                            <p className="text-xs text-virparyasRed">
                              Phone number is required
                            </p>
                          )}
                        </div>

                        <input
                          type="text"
                          id="licensePlate"
                          className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                            isInvalidPhoneNumber
                              ? "ring-2 ring-virparyasRed"
                              : ""
                          }`}
                          placeholder="Phone number..."
                          value={phoneNumber || ""}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="image"
                            className="truncate font-medium"
                          >
                            * Image:
                          </label>
                          {isInvalidImage && (
                            <p className="text-xs text-virparyasRed">
                              Image is required
                            </p>
                          )}
                        </div>

                        <div
                          className={`relative h-[125px] w-full overflow-hidden rounded-xl ${
                            isInvalidImage ? "ring-2 ring-virparyasRed" : ""
                          }`}
                        >
                          <div className="absolute top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60">
                            <CloudIcon />
                            <p className="font-medium text-white">
                              Upload a new image
                            </p>
                          </div>
                          <input
                            type="file"
                            id="image"
                            className="absolute top-0 z-10 h-full w-full cursor-pointer opacity-0"
                            accept="image/*"
                            onChange={(e) => void handleSelectImage(e)}
                          />
                          {base64Image ? (
                            <Image
                              src={base64Image}
                              alt="Image"
                              fill
                              className="object-cover"
                            ></Image>
                          ) : (
                            shipper.image && (
                              <Image
                                src={shipper.image}
                                alt="Image"
                                fill
                                className="object-cover"
                              ></Image>
                            )
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <button
                            className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                            onClick={handleDiscard}
                          >
                            Discard
                          </button>
                          {cloudinaryUploadMutation.isLoading ||
                          editShipperMutation.isLoading ? (
                            <div className="flex justify-center">
                              <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                            </div>
                          ) : (
                            <button
                              className="h-10 w-full rounded-xl bg-virparyasLightBlue font-bold text-white"
                              onClick={() => void handleEditRestaurant()}
                            >
                              Confirm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isRejectOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsRejectOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Disable {shipper.firstName} {shipper.lastName}
                  </Dialog.Title>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="phoneNumber"
                        className="whitespace-nowrap font-medium"
                      >
                        * Reason for disabling account:
                      </label>
                      {isInvalidReason && (
                        <p className="text-xs text-virparyasRed">
                          Reason is required
                        </p>
                      )}
                    </div>

                    <textarea
                      id="phoneNumber"
                      className={`h-40 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                        isInvalidReason ? "ring-2 ring-virparyasRed" : ""
                      }`}
                      placeholder="Reason for disabling account..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    {disableShipperMutation.isLoading ? (
                      <div className="flex justify-center">
                        <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                      </div>
                    ) : (
                      <button
                        className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                        onClick={() => void handleDisable()}
                      >
                        Disable account
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ShipperAdminCard;
