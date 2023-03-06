import BluePencil from "../icons/BluePencil";
import CloudIcon from "../icons/CloudIcon";
import DropDownIcon from "../icons/DropDownIcon";
import RedCross from "../icons/RedCross";
import SearchIcon from "../icons/SearchIcon";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import Image from "next/image";
import React, { Fragment, useState, useRef, useEffect } from "react";
import { api } from "~/utils/api";
import getBase64 from "~/utils/getBase64";

interface restaurantProps {
  restaurantType: {
    id: string;
    name: string;
  } | null;
  id: string;
  name: string;
  address: string;
  brandImage: string | null;
  additionalAddress: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  user: {
    email: string | null;
  };
}

interface restaurantTypeProps {
  id: string;
  name: string;
}

const AdminRestaurantsBody = ({
  restaurant,
  restaurantType,
}: {
  restaurant: restaurantProps[];
  restaurantType: restaurantTypeProps[];
}) => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const restaurantNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const additionalAddressRef = useRef<HTMLInputElement>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const [approvedList, setApprovedList] = useState<restaurantProps[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] =
    useState<restaurantProps>();

  const [image, setImage] = useState<string | null>(null);

  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null
  );
  const [restaurantTypes, setRestaurantTypes] = useState<
    restaurantTypeProps[] | null
  >(null);

  useEffect(() => {
    if (restaurant) {
      setApprovedList(restaurant);
    }
  }, [restaurant]);

  useEffect(() => {
    if (restaurantType) {
      setRestaurantTypes(restaurantType);
    }
  }, [restaurantType]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const approvedRestaurantRequestsQuery =
    api.admin.getApprovedRestaurants.useQuery(undefined, {
      onSuccess: (data) => {
        setApprovedList(data);
      },
      refetchInterval: 5000,
    });

  const editRestaurantMutation = api.admin.editRestaurant.useMutation({
    onSuccess: () => approvedRestaurantRequestsQuery.refetch(),
  });

  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onSuccess: () => approvedRestaurantRequestsQuery.refetch(),
  });

  const uploadImageMutation = api.external.uploadCloudinary.useMutation({
    onSuccess: (data) => {
      setImage(data);
    },
  });

  const handleReject = (id: string) => {
    rejectRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleEditRestaurant = (id: string) => {
    editRestaurantMutation.mutate({
      restaurantId: id,
      name: restaurantNameRef.current?.value as string,
      address: addressRef.current?.value as string,
      restaurantTypeId: selected?.id as string,
      firstname: firstNameRef.current?.value as string,
      lastname: lastNameRef.current?.value as string,
      phonenumber: phoneRef.current?.value as string,
      additionaladdress: additionalAddressRef.current?.value,
      brandImage: image,
    });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      uploadImageMutation.mutate(base64);
    }
  };

  const handleSelect = (restaurant: restaurantProps) => {
    setSelectedRestaurant(restaurant);
    setSelected(restaurant.restaurantType);
    setImage(restaurant.brandImage);
    openModal();
  };

  const handleSearch = () => {
    const search = searchRef.current?.value;
    if (search && search?.length > 2) {
      const filtered = restaurant.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(search.toLowerCase())
      );
      setApprovedList(filtered);
    } else {
      setApprovedList(restaurant);
    }
  };
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search"
          onChange={handleSearch}
          ref={searchRef}
        />
        <button
          type="button"
          className="flex items-center bg-virparyasMainBlue px-4"
        >
          <SearchIcon />
        </button>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {approvedList.map((restaurant) => (
            <div
              key={restaurant.id}
              className="flex flex-auto cursor-pointer rounded-2xl bg-white p-4 pt-3 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)]"
              onClick={() => handleSelect(restaurant)}
            >
              <div className="flex w-full items-center justify-between">
                <div className="text-virparyasMainBlue">
                  <p className="text-xl font-medium md:mt-2 md:text-3xl">
                    {restaurant.name}
                  </p>
                  <p className="text-xs font-light md:mb-2 md:text-base">
                    Restaurant
                  </p>
                </div>
                <div className="flex">
                  <button type="button" className="mr-2" onClick={openModal}>
                    <BluePencil className="md:h-10 md:w-10" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(restaurant.id)}
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
                        <Listbox value={selected} onChange={setSelected}>
                          {({ open }) => (
                            <div className="relative">
                              <Listbox.Label className="font-medium">
                                * Category:
                              </Listbox.Label>
                              <Listbox.Button
                                className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                                  open ? "ring-2 ring-virparyasMainBlue" : ""
                                }`}
                              >
                                <span className="truncate">
                                  {selected?.name}
                                </span>
                                <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                                  <DropDownIcon />
                                </span>
                              </Listbox.Button>
                              {restaurantTypes && (
                                <Transition
                                  as={Fragment}
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <Listbox.Options className="absolute mt-1 max-h-32 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                                    {restaurantTypes.map((restaurantType) => (
                                      <Listbox.Option
                                        key={restaurantType.id}
                                        className={({ active }) =>
                                          `relative cursor-default select-none text-viparyasDarkBlue ${
                                            active
                                              ? "bg-[#E9E9FF]"
                                              : "text-gray-900"
                                          }`
                                        }
                                        value={restaurantType}
                                      >
                                        {({ selected }) => (
                                          <span
                                            className={`block truncate py-2 px-4 ${
                                              selected
                                                ? "bg-virparyasMainBlue font-semibold text-white"
                                                : ""
                                            }`}
                                          >
                                            {restaurantType.name}
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
                        <div className="flex flex-col">
                          <label
                            htmlFor="restaurantName"
                            className="truncate font-medium"
                          >
                            * Restaurant Name:
                          </label>
                          <input
                            type="text"
                            id="restaurantName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedRestaurant?.name}
                            ref={restaurantNameRef}
                          />
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
                            defaultValue={selectedRestaurant?.address}
                            ref={addressRef}
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
                            defaultValue={
                              selectedRestaurant?.additionalAddress || ""
                            }
                            ref={additionalAddressRef}
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
                              defaultValue={selectedRestaurant?.firstName}
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
                              defaultValue={selectedRestaurant?.lastName}
                              ref={lastNameRef}
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
                            defaultValue={selectedRestaurant?.phoneNumber}
                            ref={phoneRef}
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
                            defaultValue={selectedRestaurant?.user?.email || ""}
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
                        onClick={() =>
                          handleEditRestaurant(selectedRestaurant?.id || "")
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

export default AdminRestaurantsBody;
