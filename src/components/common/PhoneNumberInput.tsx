import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import { useField } from "formik";
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
  formatIncompletePhoneNumber,
} from "libphonenumber-js/min";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, type HtmlHTMLAttributes } from "react";

interface PhoneNumberInputProps extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  label,
  name,
  id,
  ...props
}) => {
  const [field, meta, helper] = useField<string>(name);
  const router = useRouter();
  const country_code = router.query.country;
  const [selected, setSelected] = React.useState<CountryCode>(
    country_code as CountryCode
  );
  const prevSelectedRef = React.useRef<CountryCode>(selected);
  const helperRef = React.useRef(helper);
  useEffect(() => {
    if (prevSelectedRef.current === selected) {
      return; // selected hasn't changed, so return early
    }
    prevSelectedRef.current = selected; // update the reference
    helperRef.current.setValue(`+${getCountryCallingCode(selected)} `);
  }, [selected]);

  const format = (value: string) => {
    const phoneNumber = formatIncompletePhoneNumber(value, selected);
    if (!phoneNumber.startsWith(`+${getCountryCallingCode(selected)} `)) {
      if (value.length <= 1) {
        helper.setValue(`+${getCountryCallingCode(selected)} ${value}`);
        return;
      }
      helper.setValue(`+${getCountryCallingCode(selected)} `);
      return;
    }
    helper.setValue(phoneNumber);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label htmlFor="phoneNumber" className="font-medium">
          {label}
        </label>
        {meta.error && meta.touched && (
          <p className="text-xs text-virparyasRed">{meta.error}</p>
        )}
      </div>

      {country_code && (
        <Listbox value={selected} onChange={setSelected}>
          {({ open }) => (
            <div className="relative w-full shrink-0">
              <div className="flex gap-2">
                <Listbox.Button
                  className={`relative h-10 w-24 rounded-xl bg-white px-4 text-left ${
                    open ? "ring-2 ring-virparyasMainBlue" : ""
                  }`}
                >
                  <span className="truncate">{selected}</span>
                  <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                    <DropDownIcon />
                  </span>
                </Listbox.Button>
                <div className="grow">
                  <input
                    type="text"
                    id={id}
                    className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                      meta.error && meta.touched
                        ? "ring-2 ring-virparyasRed"
                        : ""
                    }`}
                    {...field}
                    {...props}
                    onChange={(e) => format(e.target.value)}
                  />
                </div>
              </div>

              {getCountries() && (
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                    {getCountries().map((country, countryIdx) => (
                      <Listbox.Option
                        key={countryIdx}
                        className={({ active }) =>
                          `relative cursor-default select-none text-viparyasDarkBlue ${
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
                            {country}
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
    </div>
  );
};

export default PhoneNumberInput;
