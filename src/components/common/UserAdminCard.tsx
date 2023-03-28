import BluePencil from "../icons/BluePencil";
import CloudIcon from "../icons/CloudIcon";
import RedCross from "../icons/RedCross";
import Loading from "./Loading";
import { Transition, Dialog } from "@headlessui/react";
import { type User } from "@prisma/client";
import Image from "next/image";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";
import useBase64 from "~/utils/useBase64";

interface ShipperAdminCardProps {
  user: User;
  userList: User[];
  setUserList: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserAdminCard: React.FC<ShipperAdminCardProps> = ({
  user,
  userList,
  setUserList,
}) => {
  const utils = api.useContext();

  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address);
  const [additionalAddress, setAdditionalAddress] = useState(
    user.additionalAddress
  );
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [reason, setReason] = useState("");

  const { result: base64Image } = useBase64(imageFile);

  const [isInvalidName, setIsInvalidName] = useState<boolean | null>(null);
  const [isInvalidAddress, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);
  const [isInvalidImage, setIsInvalidImage] = useState<boolean | null>(null);

  const [isInvalidReason, setIsInvalidReason] = useState<boolean | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const editUserMutation = api.admin.editUser.useMutation({
    onSuccess: (data) => {
      const newUserList = userList.map((user) => {
        if (user.id === data.id) {
          return {
            ...user,
            name: data.name,
            address: data.address,
            additionalAddress: data.additionalAddress,
            phoneNumber: data.phoneNumber,
            image: data.image,
          };
        } else {
          return user;
        }
      });
      setUserList(newUserList);
    },
    onSettled: () => {
      void utils.admin.getUsers.invalidate();
    },
  });

  const cloudinaryUploadMutation = api.cloudinary.upload.useMutation();

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleEditUser = async () => {
    let isValidForm = true;

    if (!z.string().nonempty().safeParse(name).success) {
      setIsInvalidName(true);
      isValidForm = false;
    } else {
      setIsInvalidName(false);
    }

    if (!z.string().nonempty().safeParse(address).success) {
      setIsInvalidAddress(true);
      isValidForm = false;
    } else {
      setIsInvalidAddress(false);
    }

    if (
      !z.string().url().safeParse(base64Image).success &&
      !z.string().url().safeParse(user.image).success
    ) {
      setIsInvalidImage(true);
      isValidForm = false;
      console.log("image is invalid");
    } else {
      setIsInvalidImage(false);
    }

    if (!isValidForm) return;

    if (z.string().url().safeParse(base64Image).success) {
      const secure_url = await cloudinaryUploadMutation.mutateAsync({
        file: base64Image as string,
      });
      await editUserMutation.mutateAsync({
        userId: user.id,
        name,
        address,
        additionalAddress,
        phoneNumber,
        image: secure_url,
      });
    } else {
      await editUserMutation.mutateAsync({
        userId: user.id,
        name,
        address,
        additionalAddress,
        phoneNumber,
      });
    }
    setImageFile(null);
    setIsEditOpen(false);
  };

  const disableUserMutation = api.admin.disableUser.useMutation();

  const handleDisable = async () => {
    let isValidForm = true;
    if (!z.string().nonempty().safeParse(reason).success) {
      setIsInvalidReason(true);
      isValidForm = false;
    } else {
      setIsInvalidReason(false);
    }
    if (!isValidForm) return;
    await disableUserMutation.mutateAsync({
      userId: user.id,
      reason,
    });
    setIsRejectOpen(false);
  };

  const handleDiscard = () => {
    setName(user.name);
    setAddress(user.address);
    setAdditionalAddress(user.additionalAddress);
    setPhoneNumber(user.phoneNumber);
    setIsInvalidName(null);
    setIsInvalidAddress(null);
    setIsInvalidPhoneNumber(null);
    setIsInvalidImage(null);
    setImageFile(null);
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="min-h-[2.25rem] text-xl font-medium md:mt-2 md:text-3xl">
              {user.name}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {user.email}
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
                    Edit {user.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex grow flex-col">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="name"
                            className="whitespace-nowrap font-medium"
                          >
                            * Name:
                          </label>
                          {isInvalidName && (
                            <p className="text-xs text-virparyasRed">
                              Name is required
                            </p>
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
                          <label
                            htmlFor="address"
                            className="whitespace-nowrap font-medium"
                          >
                            * Address:
                          </label>
                          {isInvalidAddress && (
                            <p className="text-xs text-virparyasRed">
                              Identification number is required
                            </p>
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
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="additionalAddress"
                            className="whitespace-nowrap font-medium"
                          >
                            Additional address:
                          </label>
                        </div>

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
                          <label
                            htmlFor="phoneNumber"
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
                          id="phoneNumber"
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
                            user.image && (
                              <Image
                                src={user.image}
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
                          editUserMutation.isLoading ? (
                            <div className="flex justify-center">
                              <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                            </div>
                          ) : (
                            <button
                              className="h-10 w-full rounded-xl bg-virparyasLightBlue font-bold text-white"
                              onClick={() => void handleEditUser()}
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
                    Disable {user.name}
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
                    {disableUserMutation.isLoading ? (
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

export default UserAdminCard;
