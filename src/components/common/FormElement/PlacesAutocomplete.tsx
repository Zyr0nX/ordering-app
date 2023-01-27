import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import Script from "next/script";
import { Fragment } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

import IconArrowDropDown from "../Icon/IconArrowDropDown";

export const PlacesAutocomplete = () => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
  } = usePlacesAutocomplete();

  const handleInput = (e: { target: { value: string } }) => {
    setValue(e.target.value);
    console.log(data);
  };

  const handleSelect = (val: string) => {
    setValue(val, false);
  };

  return (
    <>
      <Combobox>
        <div className="relative flex w-full flex-row justify-between rounded-lg border-2 border-solid border-transparent bg-neutral-200 active:border-black">
          <div className="w-full grow px-4">
            <Combobox.Input
              value={value}
              onChange={handleInput}
              disabled={!ready}
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
          >
            <Combobox.Options className="absolute top-12 -ml-3.5 w-full rounded-lg bg-white shadow-lg">
              {status === "OK" &&
                data.map(({ place_id, description }) => (
                  <Combobox.Option
                    key={place_id}
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
                          {description}
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
                ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </>
  );
};
