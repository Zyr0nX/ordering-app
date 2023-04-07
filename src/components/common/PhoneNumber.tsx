import DropDownIcon from "../icons/DropDownIcon";
import Input from "./TextInput";
import TextInput from "./TextInput";
import { Listbox, Transition } from "@headlessui/react";
import { useField } from "formik";
import { Fragment } from "react";
import PhoneNumberInput, {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input";

interface CountrySelectProps {
  name: string;
  label: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  name,
  label,
}) => {
  const [field, meta] = useField({ name });
  return (
    <div className="flex gap-2">
      <Listbox
        value={field.value as string}
        onChange={(value: string) => {
          field.onChange({ target: { value, name } });
        }}
      >
        {({ open }) => (
          <div className="relative w-24 shrink-0">
            <Listbox.Button
              className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                open ? "ring-virparyasMainBlue ring-2" : ""
              }`}
            >
              <span className="truncate">
                +{getCountryCallingCode(field.value)}
              </span>
              <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                <DropDownIcon />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                {getCountries().map((country) => (
                  <Listbox.Option
                    key={country}
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
                        {country} +{getCountryCallingCode(country)}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
};
