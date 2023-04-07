import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { type HtmlHTMLAttributes, useState } from "react";
import { Fragment } from "react";
import countries from "~/utils/countries.json";

interface PhoneNumberInputProps {
  phoneNumber: string | null | undefined;
  setPhoneNumber: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  isInvalidPhoneNumber: boolean | null;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    phoneNumber,
    setPhoneNumber,
    isInvalidPhoneNumber,
}) => {
  const router = useRouter();
  const [phonePrefix, setPhonePrefix] = useState(
    countries.find((c) => c.isoCode === router.query.country)
  );

  const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Only allow digits
    const newValue = value.replace(/\D/g, "");

    // Format the phone number
    const formattedValue = newValue.replace(
      /(\d{3})(\d{3})(\d{3})/,
      "$1-$2-$3"
    );
    setPhoneNumber(formattedValue);
  };
  return (
    <div className="flex gap-2">
      {phonePrefix && (
        <Listbox value={phonePrefix} onChange={setPhonePrefix}>
          {({ open }) => (
            <div className="relative w-24 shrink-0">
              <Listbox.Button
                className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                  open ? "ring-virparyasMainBlue ring-2" : ""
                }`}
              >
                <span className="truncate">{phonePrefix?.dialCode}</span>
                <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                  <DropDownIcon />
                </span>
              </Listbox.Button>
              {countries && (
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                    {countries.map((country) => (
                      <Listbox.Option
                        key={country.name}
                        className={({ active }) =>
                          `text-viparyasDarkBlue relative cursor-default select-none ${
                            active ? "bg-[#E9E9FF]" : "text-gray-900"
                          }`
                        }
                        value={country}
                      >
                        {({ selected }) => (
                          <span
                            className={`flex gap-2 truncate px-4 py-2 ${
                              selected
                                ? "bg-virparyasMainBlue font-semibold text-white"
                                : ""
                            }`}
                          >
                            <Image
                              src={country.flag}
                              width={20}
                              height={10}
                              alt="flag"
                            ></Image>
                            {country.dialCode}
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
      )}
      <input
        type="text"
        id="phoneNumber"
        className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
          isInvalidPhoneNumber ? "ring-virparyasRed ring-2" : ""
        }`}
        placeholder="Phone..."
        value={
          phoneNumber?.startsWith(`(${phonePrefix?.dialCode || ""}) `)
            ? phoneNumber?.slice((phonePrefix?.dialCode.length || 0) + 3)
            : phoneNumber || ""
        }
        onChange={(e) => formatPhoneNumber(e)}
      />
    </div>
  );
};

export default PhoneNumberInput;
