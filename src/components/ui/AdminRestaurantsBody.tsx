import CommonDialog from "../common/CommonDialog";
import CommonImageInput from "../common/CommonImageInput";
import CommonInput from "../common/CommonInput";
import CommonSearch from "../common/CommonSearch";
import BluePencil from "../icons/BluePencil";
import DropDownIcon from "../icons/DropDownIcon";
import RedCross from "../icons/RedCross";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import { Transition, Listbox } from "@headlessui/react";
import { type Restaurant, type User, type Cuisine } from "@prisma/client";
import fuzzysort from "fuzzysort";
import React, { Fragment, useState, useRef, useEffect } from "react";
import { api } from "~/utils/api";

const AdminRestaurantsBody = ({
  restaurants,
  cuisines,
}: {
  restaurants: (Restaurant & {
    user: User;
    cuisine: Cuisine | null;
  })[];

  cuisines: Cuisine[];
}) => {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);
  const restaurantNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const additionalAddressRef = useRef<HTMLInputElement>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState<
    Restaurant & {
      user: User;
      cuisine: Cuisine | null;
    }
  >();

  const [image, setImage] = useState<string | null>(null);

  const [selected, setSelected] = useState<Cuisine | null>(null);

  const utils = api.useContext();

  // useEffect(() => {
  //   console.log("running");
  //   if (searchRef.current?.value !== undefined && searchRef.current.value.length > 2) {
  //     utils.admin.getApprovedRestaurants.setData(undefined, (old) => {
  //       return fuzzysort.go(searchRef.current?.value as string, old, {
  //         key: "name",
  //         });
  //       });

  //   }
  // }, [searchRef.current?.value, utils.admin.getApprovedRestaurants]);

  const approvedRestaurantQuery = api.admin.getApprovedRestaurants.useQuery(
    undefined,
    {
      initialData: restaurants,
      refetchInterval: 5000,
      enabled: false,
    }
  );

  const editRestaurantMutation = api.admin.editRestaurant.useMutation({
    onMutate: async (newData) => {
      await utils.admin.getApprovedRestaurants.cancel();
      const prevData = utils.admin.getApprovedRestaurants.getData();
      utils.admin.getApprovedRestaurants.setData(undefined, (old) => {
        return old?.map((restaurant) => {
          if (restaurant.id === newData.restaurantId) {
            return {
              ...restaurant,
              name: newData.name,
              address: newData.address,
              firstName: newData.firstname,
              lastName: newData.lastname,
              phoneNumber: newData.phonenumber,
              additionalAddress: newData.additionaladdress as string,
              brandImage: newData.brandImage as string,
              cuisine: {
                id: newData.cuisineId,
                name: selected?.name as string,
                image: "",
              },
            };
          } else {
            return restaurant;
          }
        });
      });
      return { prevData };
    },
    onSettled: async () => {
      await utils.admin.getApprovedRestaurants.invalidate();
    },
  });

  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onMutate: async (newData) => {
      await utils.admin.getApprovedRestaurants.cancel();
      const prevData = utils.admin.getApprovedRestaurants.getData();
      utils.admin.getApprovedRestaurants.setData(undefined, (old) => {
        return old?.filter(
          (restaurant) => restaurant.id !== newData.restaurantId
        );
      });
      return { prevData };
    },
    onSettled: async () => {
      await utils.admin.getApprovedRestaurants.invalidate();
    },
  });

  // const handleSearch = async () => {
  //   await utils.admin.getApprovedRestaurants.cancel();
  //   const prevData = utils.admin.getApprovedRestaurants.getData();
  //   const a = utils.admin.getApprovedRestaurants.setData(undefined, (old) => {
  //     return fuzzysort
  //       .go(searchRef.current?.value as string, old, {
  //         key: "name",
  //       }).map((item): { obj: typeof old} => item.obj);
  //   });
  //   console.log(a);
  //   return { prevData };
  // };

  const handleReject = (id: string) => {
    rejectRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleEditRestaurant = (id: string) => {
    editRestaurantMutation.mutate({
      restaurantId: id,
      name: restaurantNameRef.current?.value as string,
      address: addressRef.current?.value as string,
      cuisineId: selected?.id as string,
      firstname: firstNameRef.current?.value as string,
      lastname: lastNameRef.current?.value as string,
      phonenumber: phoneNumberRef.current?.value as string,
      additionaladdress: additionalAddressRef.current?.value,
      brandImage: image,
    });
  };

  const handleSelect = (
    restaurant: Restaurant & {
      user: User;
      cuisine: Cuisine | null;
    }
  ) => {
    setIsOpen(true);
    setSelectedRestaurant(restaurant);
    setSelected(
      cuisines.find((cuisine) => cuisine.id === restaurant.cuisineId) ?? null
    );
    setImage(restaurant.brandImage);
  };

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search..."
          ref={searchRef}
        />
        <div
          className="flex items-center bg-virparyasMainBlue px-4"
          // onClick={handleSearch}
        >
          <SearchIcon />
        </div>
      </div>
      <div className="mt-4">
        {approvedRestaurantQuery.data.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No restaurants found</p>
            <SleepIcon />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {approvedRestaurantQuery.data.map((restaurant) => (
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
                      <button
                        type="button"
                        className="relative z-10 mr-2"
                        onClick={() => setIsOpen(true)}
                      >
                        <BluePencil className="md:h-10 md:w-10" />
                      </button>
                      <button
                        type="button"
                        className="relative z-10"
                        onClick={() => handleReject(restaurant.id)}
                      >
                        <RedCross className="md:h-10 md:w-10" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CommonDialog
              label="Edit mode"
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            >
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
                        <span className="truncate">{selected?.name}</span>
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
                          <Listbox.Options className="absolute mt-1 max-h-32 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                            {cuisines.map((cuisine) => (
                              <Listbox.Option
                                key={cuisine.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none text-viparyasDarkBlue ${
                                    active ? "bg-[#E9E9FF]" : "text-gray-900"
                                  }`
                                }
                                value={cuisine}
                              >
                                {({ selected }) => (
                                  <span
                                    className={`block truncate py-2 px-4 ${
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
                <CommonInput
                  label="* Restaurant name:"
                  id="restaurantName"
                  placeholder="Restaurant name..."
                  defaultValue={selectedRestaurant?.name}
                  ref={restaurantNameRef}
                />
                <CommonInput
                  label="* Address"
                  id="address"
                  placeholder="Address..."
                  defaultValue={selectedRestaurant?.address}
                  ref={addressRef}
                />
                <CommonInput
                  label="Additional Address"
                  id="additionalAddress"
                  placeholder="Additional Address..."
                  defaultValue={selectedRestaurant?.additionalAddress || ""}
                  ref={additionalAddressRef}
                />
                <div className="flex gap-4">
                  <CommonInput
                    label="* First name:"
                    id="firstName"
                    placeholder="First name..."
                    defaultValue={selectedRestaurant?.firstName}
                    ref={firstNameRef}
                  />
                  <CommonInput
                    label="* Last name:"
                    id="lastName"
                    placeholder="Last name..."
                    defaultValue={selectedRestaurant?.lastName}
                    ref={lastNameRef}
                  />
                </div>
                <CommonInput
                  label="* Phone number:"
                  id="phoneNumber"
                  placeholder="Phone number..."
                  defaultValue={selectedRestaurant?.phoneNumber}
                  ref={phoneNumberRef}
                />
                <CommonInput
                  label="Email:"
                  id="email"
                  placeholder="Email..."
                  defaultValue={selectedRestaurant?.user.email || ""}
                  disabled
                />
                <CommonImageInput
                  label="Brand image"
                  image={image}
                  setImage={setImage}
                />
              </div>
              <div className="px-auto mt-4 flex justify-center gap-4">
                <button
                  type="button"
                  className="w-36 rounded-xl bg-virparyasRed py-2 px-10 font-medium text-white"
                  onClick={() => setIsOpen(false)}
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
            </CommonDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantsBody;
