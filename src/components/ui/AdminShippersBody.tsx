import BluePencil from "../icons/BluePencil";
import CloudIcon from "../icons/CloudIcon";
import DropDownIcon from "../icons/DropDownIcon";
import RedCross from "../icons/RedCross";
import SearchIcon from "../icons/SearchIcon";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { type Shipper, type User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useRef, useState } from "react";
import { api } from "~/utils/api";
import dates from "~/utils/dates.json";
import getBase64 from "~/utils/getBase64";
import months from "~/utils/months.json";
import years from "~/utils/years.json";


const AdminShippersBody = ({
  shippers,
}: {
  shippers: (Shipper & {
    user: User;
  })[];
}) => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedMonth, setSelectedMonth] = useState(months[0])
  const [selectedYear, setSelectedYear] = useState(years[30]);

  const [isOpen, setIsOpen] = useState(false);

  const [selectedShipper, setSelectedShipper] = useState<
    Shipper & {
      user: User;
    }
  >();

  const [image, setImage] = useState<string | null>(null);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const utils = api.useContext();

  const approvedShippersQuery = api.admin.getApprovedShippers.useQuery(
    undefined,
    {
      initialData: shippers,
      refetchInterval: 5000,
    }
  );

  const rejectShipperMutation = api.admin.rejectShipper.useMutation({
    onMutate: async (newData) => {
      await utils.admin.getApprovedShippers.cancel();
      const prevData = utils.admin.getApprovedShippers.getData();
      utils.admin.getApprovedShippers.setData(undefined, (old) => {
        return old?.filter((shipper) => shipper.id !== newData.shipperId);
      });
      return { prevData };
    },
    onSettled: async () => {
      await utils.admin.getApprovedShippers.invalidate();
    },
  });

  const uploadImageMutation = api.external.uploadCloudinary.useMutation({
    onSuccess: (data) => {
      setImage(data);
    },
  });

  const handleReject = (id: string) => {
    rejectShipperMutation.mutate({ shipperId: id });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      uploadImageMutation.mutate(base64);
    }
  };

  const handleSelect = (
    shipper: Shipper & {
      user: User;
    }
  ) => {
    openModal();
    setSelectedShipper(shipper);
    setImage(shipper.avatar);
  };

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search"
          ref={searchRef}
        />
        <Link
          href={`/admin/restaurants/search?searchQuery=${
            searchRef.current?.value as string
          }`}
          className="flex items-center bg-virparyasMainBlue px-4"
        >
          <SearchIcon />
        </Link>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {approvedShippersQuery.data.map((shipper) => (
            <div
              key={shipper.id}
              className="flex flex-auto cursor-pointer rounded-2xl bg-white p-4 pt-3 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)]"
              onClick={() => handleSelect(shipper)}
            >
              <div className="flex w-full items-center justify-between">
                <div className="text-virparyasMainBlue">
                  <p className="text-xl font-medium md:mt-2 md:text-3xl">
                    {shipper.firstName + " " + shipper.lastName}
                  </p>
                  <p className="text-xs font-light md:mb-2 md:text-base">
                    Restaurant
                  </p>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    className="relative z-10 mr-2"
                    onClick={openModal}
                  >
                    <BluePencil className="md:h-10 md:w-10" />
                  </button>
                  <button
                    type="button"
                    className="relative z-10"
                    onClick={() => handleReject(shipper.id)}
                  >
                    <RedCross className="md:h-10 md:w-10" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                  <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all md:w-3/4">
                    <Dialog.Title as="h3" className="text-3xl font-bold">
                      Edit Mode
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor="firstName"
                              className="truncate font-medium"
                            >
                              First name:
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                              placeholder="Email..."
                              defaultValue={selectedShipper?.firstName}
                              ref={firstNameRef}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label
                              htmlFor="lastName"
                              className="truncate font-medium"
                            >
                              Last name:
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                              placeholder="Email..."
                              defaultValue={selectedShipper?.lastName}
                              ref={lastNameRef}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="restaurantName"
                            className="truncate font-medium"
                          >
                            * Date of birth:
                          </label>
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
                                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
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
                                                className={`block truncate py-2 px-4 ${
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
                                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
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
                                                className={`block truncate py-2 px-4 ${
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
                                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
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
                                                className={`block truncate py-2 px-4 ${
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
                          <label
                            htmlFor="address"
                            className="truncate font-medium"
                          >
                            Address:
                          </label>
                          <input
                            type="text"
                            id="address"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            // defaultValue={selectedRestaurant?.address}
                            // ref={addressRef}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="additionalAddress"
                            className="truncate font-medium"
                          >
                            Additional Address:
                          </label>
                          <input
                            type="text"
                            id="additionalAddress"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            // defaultValue={
                            //   selectedRestaurant?.additionalAddress || ""
                            // }
                            // ref={additionalAddressRef}
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor="firstName"
                              className="truncate font-medium"
                            >
                              First name:
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                              placeholder="Email..."
                              //   defaultValue={selectedRestaurant?.firstName}
                              //   ref={firstNameRef}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label
                              htmlFor="lastName"
                              className="truncate font-medium"
                            >
                              Last name:
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                              placeholder="Email..."
                              //   defaultValue={selectedRestaurant?.lastName}
                              //   ref={lastNameRef}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="phone"
                            className="truncate font-medium"
                          >
                            Phone number:
                          </label>
                          <input
                            type="text"
                            id="phone"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            // defaultValue={selectedRestaurant?.phoneNumber}
                            // ref={phoneRef}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="email"
                            className="truncate font-medium"
                          >
                            Email:
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue disabled:bg-white disabled:text-gray-500"
                            placeholder="Email..."
                            // defaultValue={selectedRestaurant?.user?.email || ""}
                            disabled
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="brandImage"
                            className="truncate font-medium"
                          >
                            Brand image:
                          </label>
                          <div className="relative h-[125px] w-full overflow-hidden rounded-xl">
                            <div className="absolute top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60">
                              <CloudIcon />
                              <p className="font-medium text-white">
                                Upload a new brand image
                              </p>
                            </div>
                            <input
                              type="file"
                              id="brandImage"
                              className="absolute top-0 z-10 h-full w-full cursor-pointer opacity-0"
                              accept="image/*"
                              onChange={(e) => void handleImage(e)}
                            />
                            {image && (
                              <Image
                                src={image}
                                alt="Brand Image"
                                fill
                                className="object-cover"
                              ></Image>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-auto mt-4 flex justify-center gap-4">
                      <button
                        type="button"
                        className="w-36 rounded-xl bg-virparyasRed py-2 px-10 font-medium text-white"
                        onClick={closeModal}
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        className="w-36 rounded-xl bg-virparyasGreen py-2 font-medium text-white"
                        // onClick={() =>
                        //   handleEditRestaurant(selectedRestaurant?.id || "")
                        // }
                      >
                        Confirm
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default AdminShippersBody;