import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import { useField } from "formik";
import React, { Fragment } from "react";
import { api } from "~/utils/api";

interface CuisineListboxProps {
  label: string;
  name: string;
  placeholder?: string;
}

const CuisineListbox: React.FC<CuisineListboxProps> = ({
  label,
  name,
  placeholder,
}) => {
  const { data: cuisines } = api.cuisine.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const [field, meta] = useField<string>(name);
  if (!cuisines) return null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label htmlFor="cuisine" className="whitespace-nowrap font-medium">
          {label}
        </label>
        {meta.error && meta.touched && (
          <p className="text-xs text-virparyasRed">{meta.error}</p>
        )}
      </div>

      <Listbox
        value={field.value}
        onChange={(value) => {
          field.onChange({
            target: {
              value: value,
              name,
            },
          });
        }}
      >
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                open
                  ? "ring-2 ring-virparyasMainBlue"
                  : meta.error && meta.touched
                  ? "ring-2 ring-virparyasRed"
                  : ""
              }`}
            >
              <span
                className={`truncate ${field.value ? "" : "text-gray-400"}`}
              >
                {!field.value
                  ? placeholder
                  : cuisines.find((cuisine) => cuisine.id === field.value)
                      ?.name}
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
                <Listbox.Options className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                  {cuisines.map((cuisine) => (
                    <Listbox.Option
                      key={cuisine.id}
                      className={({ active }) =>
                        `relative cursor-default select-none text-viparyasDarkBlue ${
                          active ? "bg-[#E9E9FF]" : "text-gray-900"
                        }`
                      }
                      value={cuisine.id}
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
  );
};

export default CuisineListbox;
