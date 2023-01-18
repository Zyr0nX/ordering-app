import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import { Fragment, InputHTMLAttributes, ReactElement, useEffect } from "react";
import React, { useState } from "react";

import type { Feature, MapboxPlaces } from "../../../types/mapbox-places";
import IconArrowDropDown from "../Icon/IconArrowDropDown";
import IconPlus from "../Icon/IconPlus";
import Button from "./Button";

export interface ComboBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  Icon?: ReactElement;
  value: string;
  a: any;
}

const ComboBox = ({ placeholder, value, a }: ComboBoxProps) => {
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [query, setQuery] = useState("");

  const { isLoading, error, data } = useQuery({
    queryKey: ["mapboxSearch", query],
    queryFn: async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg`
      );
      return res.json();
    },
    initialData: [],
  });

  const filteredData =
    query === ""
      ? data?.features
      : data?.features?.filter((feature: Feature) =>
          feature.place_name.toLowerCase()
        );

  return (
    <Combobox value={value} onChange={a}>
      <div className="relative flex w-full flex-row justify-between rounded-lg border-2 border-solid border-transparent bg-neutral-200 active:border-black">
        <div className="w-full grow px-4">
          <Combobox.Input
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            className="m-0 h-full w-full text-ellipsis border-none bg-neutral-200 py-2.5 pl-3 text-left text-base leading-6 outline-none"
            displayValue={(feature: Feature) => feature.place_name}
            placeholder="Address"
          />
        </div>
        <div className="flex items-center pr-3">
          <IconArrowDropDown viewBox="0 0 24 24" className="h-5 w-5" />
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute top-12 -ml-3.5 w-full rounded-lg bg-white shadow-lg">
            {filteredData?.length === 0 && query !== "" ? (
              <>
                <div className="p-6 text-center text-neutral-300">
                  Nothing found.
                </div>
                <div className="mt-2 flex w-28 items-center justify-center">
                  <Button
                    Icon={<IconPlus viewBox="0 0 24 24" className="h-6 w-6" />}
                    name="Enter manualy"
                  ></Button>
                </div>
              </>
            ) : (
              filteredData?.map((data: Feature) => (
                <Combobox.Option
                  key={data.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={data}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {data.place_name}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

export default ComboBox;
