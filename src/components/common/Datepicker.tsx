import DropDownIcon from "../icons/DropDownIcon";
import { Listbox, Transition } from "@headlessui/react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useField } from "formik";
import React, { Fragment, useEffect, useRef } from "react";

dayjs.extend(customParseFormat);

interface DatepickerProps {
  label: string;
  name: string;
}

const Datepicker: React.FC<DatepickerProps> = ({ label, name }) => {
  const [field, meta] = useField<{
    date: string;
    month: string;
    year: string;
  }>(name);

  const fieldRef = useRef(field);

  useEffect(() => {
    if (
      !dayjs(
        `${field.value.year}-${field.value.month}-${field.value.date}`,
        "YYYY-MMM-D",
        true
      ).isValid()
    ) {
      fieldRef.current.onChange({
        target: {
          name,
          value: {
            date: dayjs(
              `${field.value.year}-${field.value.month}`,
              "YYYY-MMM"
            ).daysInMonth(),
            month: field.value.month,
            year: field.value.year,
          },
        },
      });
    }
  }, [field.value.date, field.value.month, field.value.year, name]);
  return (
    <div className="flex flex-col">
      <div className="inline-flex items-center justify-between">
        <label htmlFor="lastName" className="whitespace-nowrap font-medium">
          {label}
        </label>
        {meta.error && meta.touched && (
          <p className="text-xs text-virparyasRed">{meta.error}</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Listbox
          value={field.value.date}
          onChange={(values) => {
            field.onChange({
              target: {
                name,
                value: {
                  date: values,
                  month: field.value.month,
                  year: field.value.year,
                },
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
                <span className="truncate">{field.value.date}</span>
                <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                  <DropDownIcon />
                </span>
              </Listbox.Button>
              {
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                    {Array.from(
                      {
                        length: dayjs(
                          `${field.value.year}-${field.value.month}`
                        ).daysInMonth(),
                      },
                      (_, index) =>
                        dayjs(
                          `${field.value.year}-${field.value.month}-${
                            index + 1
                          }`
                        ).format("D")
                    ).map((day) => (
                      <Listbox.Option
                        key={day}
                        className={({ active }) =>
                          `relative cursor-default select-none text-viparyasDarkBlue ${
                            active ? "bg-[#E9E9FF]" : "text-gray-900"
                          }`
                        }
                        value={day}
                      >
                        {({ selected }) => (
                          <span
                            className={`block truncate px-4 py-2 ${
                              selected
                                ? "bg-virparyasMainBlue font-semibold text-white"
                                : ""
                            }`}
                          >
                            {day}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              }
            </div>
          )}
        </Listbox>
        <Listbox
          value={field.value.month}
          onChange={(values) => {
            field.onChange({
              target: {
                name,
                value: {
                  date: field.value.date,
                  month: values,
                  year: field.value.year,
                },
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
                <span className="truncate">{field.value.month}</span>
                <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                  <DropDownIcon />
                </span>
              </Listbox.Button>
              {
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                    {Array.from({ length: 12 }, (_, index) =>
                      dayjs().month(index).format("MMM")
                    ).map((month) => (
                      <Listbox.Option
                        key={month}
                        className={({ active }) =>
                          `relative cursor-default select-none text-viparyasDarkBlue ${
                            active ? "bg-[#E9E9FF]" : "text-gray-900"
                          }`
                        }
                        value={month}
                      >
                        {({ selected }) => (
                          <span
                            className={`block truncate px-4 py-2 ${
                              selected
                                ? "bg-virparyasMainBlue font-semibold text-white"
                                : ""
                            }`}
                          >
                            {month}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              }
            </div>
          )}
        </Listbox>
        <Listbox
          value={field.value.year}
          onChange={(values) => {
            field.onChange({
              target: {
                name,
                value: {
                  date: field.value.date,
                  month: field.value.month,
                  year: values,
                },
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
                <span className="truncate">{field.value.year}</span>
                <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                  <DropDownIcon />
                </span>
              </Listbox.Button>
              {
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                    {Array.from({ length: 50 }, (_, index) =>
                      dayjs().subtract(index, "year").format("YYYY")
                    )
                      .reverse()
                      .map((year) => (
                        <Listbox.Option
                          key={year}
                          className={({ active }) =>
                            `relative cursor-default select-none text-viparyasDarkBlue ${
                              active ? "bg-[#E9E9FF]" : "text-gray-900"
                            }`
                          }
                          value={year}
                        >
                          {({ selected }) => (
                            <span
                              className={`block truncate px-4 py-2 ${
                                selected
                                  ? "bg-virparyasMainBlue font-semibold text-white"
                                  : ""
                              }`}
                            >
                              {year}
                            </span>
                          )}
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </Transition>
              }
            </div>
          )}
        </Listbox>
      </div>
    </div>
  );
};

export default Datepicker;
