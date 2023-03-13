import BluePencil from "../icons/BluePencil";
import CloudIcon from "../icons/CloudIcon";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import { Dialog, Transition } from "@headlessui/react";
import { type User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState, useRef } from "react";
import { api } from "~/utils/api";
import getBase64 from "~/utils/getBase64";

const AdminUsersBody = ({ users }: { users: User[] }) => {
  const nameRef = useRef<HTMLInputElement>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [image, setImage] = useState<string | null>(null);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const utils = api.useContext();

  const userQuery = api.admin.getUsers.useQuery(undefined, {
    initialData: users,
    refetchInterval: 5000,
  });

  const editUserMutation = api.admin.editUser.useMutation({
    onMutate: async (newData) => {
      await utils.admin.getUsers.cancel();
      const prevData = utils.admin.getUsers.getData();
      utils.admin.getUsers.setData(undefined, (old) => {
        return old?.map((user) => {
          if (user.id === newData.userId) {
            return {
              ...user,
              name: newData.name,
              image: newData.image,
            };
          } else {
            return user;
          }
        });
      });
      return { prevData };
    },
    onSettled: async () => {
      await utils.admin.getApprovedRestaurants.invalidate();
    },
  });

  const uploadImageMutation = api.external.uploadCloudinary.useMutation({
    onSuccess: (data) => {
      setImage(data);
    },
  });

  const handleEditRestaurant = (id: string) => {
    editUserMutation.mutate({
      userId: id,
      name: nameRef.current?.value as string,
      image: image,
    });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      uploadImageMutation.mutate(base64);
    }
  };

  const handleSelect = (user: User) => {
    openModal();
    setSelectedUser(user);
    setImage(user.image);
  };

  if (userQuery.data.length === 0) {
    return (
      <div className="m-4 text-virparyasMainBlue">
        <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
          <p className="text-xl font-semibold">No restaurants found</p>
          <SleepIcon />
        </div>
      </div>
    );
  }

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
          {userQuery.data.map((user) => (
            <div
              key={user.id}
              className="flex flex-auto cursor-pointer rounded-2xl bg-white p-4 pt-3 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)]"
              onClick={() => handleSelect(user)}
            >
              <div className="flex w-full items-center justify-between">
                <div className="text-virparyasMainBlue">
                  <p className="text-xl font-medium md:mt-2 md:text-3xl">
                    {user.name}
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
                        <div className="flex flex-col">
                          <label
                            htmlFor="restaurantName"
                            className="truncate font-medium"
                          >
                            * Name:
                          </label>
                          <input
                            type="text"
                            id="restaurantName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedUser?.name ?? ""}
                            ref={nameRef}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="address"
                            className="truncate font-medium"
                          >
                            Email:
                          </label>
                          <input
                            type="text"
                            id="address"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedUser?.email ?? ""}
                            disabled
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="brandImage"
                            className="truncate font-medium"
                          >
                            Image:
                          </label>
                          <div className="relative h-[125px] w-full overflow-hidden rounded-xl">
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
                        onClick={() =>
                          handleEditRestaurant(selectedUser?.id || "")
                        }
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

export default AdminUsersBody;
