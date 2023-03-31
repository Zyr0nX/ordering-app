import BluePencil from "../icons/BluePencil";
import CloudIcon from "../icons/CloudIcon";
import DropDownIcon from "../icons/DropDownIcon";
import RedCross from "../icons/RedCross";
import Loading from "./Loading";
import { Transition, Dialog, Listbox } from "@headlessui/react";
import { type User, type Restaurant, type Cuisine } from "@prisma/client";
import Image from "next/image";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import useBase64 from "~/utils/useBase64";

interface RestaurantAdminCardProps {
  restaurant: Restaurant & {
    user: User;
    cuisine: Cuisine;
  };
  cuisines: Cuisine[];
  restaurantList: (Restaurant & {
    user: User;
    cuisine: Cuisine;
  })[];
  setRestaurantList: React.Dispatch<
    React.SetStateAction<
      (Restaurant & {
        user: User;
        cuisine: Cuisine;
      })[]
    >
  >;
}

const RestaurantAdminCard: React.FC<RestaurantAdminCardProps> = ({
  restaurant,
  cuisines,
  restaurantList,
  setRestaurantList,
}) => {
  const utils = api.useContext();

  const [firstName, setFirstName] = useState(restaurant.firstName);
  const [lastName, setLastName] = useState(restaurant.lastName);
  const [phoneNumber, setPhoneNumber] = useState(restaurant.phoneNumber);
  const [restaurantName, setRestaurantName] = useState(restaurant.name);
  const [address, setAddress] = useState(restaurant.address);
  const [additionalAddress, setAdditionalAddress] = useState(
    restaurant.additionalAddress
  );
  const [cuisine, setCuisine] = useState(restaurant.cuisine);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [reason, setReason] = useState("");

  const { result: base64Image } = useBase64(imageFile);

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
  const [isInvalidImage, setIsInvalidImage] = useState<boolean | null>(null);

  const [isInvalidReason, setIsInvalidReason] = useState<boolean | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const editRestaurantMutation = api.admin.editRestaurant.useMutation({
    onSuccess: (data) => {
      const newRestaurantList = restaurantList.map((restaurant) => {
        if (restaurant.id === data.id) {
          return {
            ...restaurant,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            name: data.name,
            address: data.address,
            additionalAddress: data.additionalAddress,
            cuisineId: data.cuisineId,
            image: data.image,
          };
        } else {
          return restaurant;
        }
      });
      setRestaurantList(newRestaurantList);
    },
    onSettled: () => {
      void utils.admin.getApprovedRestaurants.invalidate();
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

    if (!z.string().nonempty().safeParse(restaurantName).success) {
      setIsInvalidRestaurantName(true);
      isValidForm = false;
    } else {
      setIsInvalidRestaurantName(false);
    }

    if (!z.string().nonempty().safeParse(address).success) {
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

    if (!z.string().nonempty().safeParse(cuisine?.id).success) {
      setIsInvalidCuisine(true);
      isValidForm = false;
    } else {
      setIsInvalidCuisine(false);
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

    if (
      !z.string().url().safeParse(base64Image).success &&
      !z.string().url().safeParse(restaurant.image).success
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
      await editRestaurantMutation.mutateAsync({
        restaurantId: restaurant.id,
        restaurantName,
        address,
        additionalAddress,
        firstName,
        lastName,
        cuisineId: cuisine?.id,
        phoneNumber,
        image: secure_url,
      });
    } else {
      await editRestaurantMutation.mutateAsync({
        restaurantId: restaurant.id,
        restaurantName,
        address,
        additionalAddress,
        firstName,
        lastName,
        cuisineId: cuisine?.id,
        phoneNumber,
      });
    }
    setImageFile(null);
    setIsEditOpen(false);
  };

  const disableRestaurantMutation = api.admin.disableRestaurant.useMutation();

  const handleDisable = async () => {
    let isValidForm = true;
    if (!z.string().nonempty().safeParse(reason).success) {
      setIsInvalidReason(true);
      isValidForm = false;
    } else {
      setIsInvalidReason(false);
    }
    if (!isValidForm) return;
    await disableRestaurantMutation.mutateAsync({
      restaurantId: restaurant.id,
      reason,
    });
    setIsRejectOpen(false);
  };

  const handleDiscard = () => {
    setFirstName(restaurant.firstName);
    setLastName(restaurant.lastName);
    setPhoneNumber(restaurant.phoneNumber);
    setRestaurantName(restaurant.name);
    setAddress(restaurant.address);
    setAdditionalAddress(restaurant.additionalAddress);
    setCuisine(restaurant.cuisine);
    setImageFile(null);
    setIsInvalidFirstName(null);
    setIsInvalidLastName(null);
    setIsInvalidPhoneNumber(null);
    setIsInvalidRestaurantName(null);
    setIsInvalidAddress(null);
    setIsInvalidCuisine(null);
    setIsInvalidImage(null);
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {restaurant.name}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {restaurant.address}
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
                <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 transform overflow-hidden rounded-2xl p-6 transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit {restaurant.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="cuisine"
                            className="whitespace-nowrap font-medium"
                          >
                            * Cuisine:
                          </label>
                          {isInvalidCuisine && (
                            <p className="text-virparyasRed text-xs">
                              Cuisine is required
                            </p>
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
                                            active
                                              ? "bg-[#E9E9FF]"
                                              : "text-gray-900"
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
                            isInvalidRestaurantName
                              ? "ring-virparyasRed ring-2"
                              : ""
                          }`}
                          placeholder="Restaurant name..."
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="address"
                            className="whitespace-nowrap font-medium"
                          >
                            * Address:
                          </label>
                          {isInvalidAddress && (
                            <p className="text-virparyasRed text-xs">
                              Address is required
                            </p>
                          )}
                        </div>

                        <input
                          type="text"
                          id="address"
                          className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                            isInvalidAddress ? "ring-virparyasRed ring-2" : ""
                          }`}
                          placeholder="Address..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
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
                              isInvalidFirstName
                                ? "ring-virparyasRed ring-2"
                                : ""
                            }`}
                            placeholder="First name..."
                            value={firstName}
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
                              isInvalidLastName
                                ? "ring-virparyasRed ring-2"
                                : ""
                            }`}
                            placeholder="Last name..."
                            value={lastName}
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
                              Address is required
                            </p>
                          )}
                        </div>

                        <input
                          type="text"
                          id="phoneNumber"
                          className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                            isInvalidPhoneNumber
                              ? "ring-virparyasRed ring-2"
                              : ""
                          }`}
                          placeholder="Address..."
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="email"
                          className="whitespace-nowrap font-medium"
                        >
                          Email:
                        </label>

                        <input
                          type="email"
                          id="email"
                          className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                          disabled
                          value={restaurant.user.email || ""}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="brandImage"
                            className="truncate font-medium"
                          >
                            * Image:
                          </label>
                          {isInvalidImage && (
                            <p className="text-virparyasRed text-xs">
                              Image is required
                            </p>
                          )}
                        </div>

                        <div
                          className={`relative h-[125px] w-full overflow-hidden rounded-xl ${
                            isInvalidImage ? "ring-virparyasRed ring-2" : ""
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
                            id="brandImage"
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
                            <Image
                              src={restaurant.image || ""}
                              alt="Image"
                              fill
                              className="object-cover"
                            ></Image>
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <button
                            className="bg-virparyasRed h-10 w-full rounded-xl font-bold text-white"
                            onClick={handleDiscard}
                          >
                            Discard
                          </button>
                          {cloudinaryUploadMutation.isLoading ||
                          editRestaurantMutation.isLoading ? (
                            <div className="flex justify-center">
                              <Loading className="fill-virparyasMainBlue h-10 w-10 animate-spin text-gray-200" />
                            </div>
                          ) : (
                            <button
                              className="bg-virparyasLightBlue h-10 w-full rounded-xl font-bold text-white"
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
                <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 transform overflow-hidden rounded-2xl p-6 transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Disable {restaurant.name}
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
                        <p className="text-virparyasRed text-xs">
                          Reason is required
                        </p>
                      )}
                    </div>

                    <textarea
                      id="phoneNumber"
                      className={`focus-visible:ring-virparyasMainBlue h-40 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                        isInvalidReason ? "ring-virparyasRed ring-2" : ""
                      }`}
                      placeholder="Reason for disabling account..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    {disableRestaurantMutation.isLoading ? (
                      <div className="flex justify-center">
                        <Loading className="fill-virparyasMainBlue h-10 w-10 animate-spin text-gray-200" />
                      </div>
                    ) : (
                      <button
                        className="bg-virparyasRed h-10 w-full rounded-xl font-bold text-white"
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

export default RestaurantAdminCard;
