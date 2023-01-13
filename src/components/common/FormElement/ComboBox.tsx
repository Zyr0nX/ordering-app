import { Fragment, InputHTMLAttributes, ReactElement } from "react";
import React, { forwardRef, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import IconArrowDropDown from "../Icon/IconArrowDropDown";
import IconPlus from "../Icon/IconPlus";
import Button from "./Button";
import Search from "@mapbox/search-js-web";
import { mapboxSearch } from "../../../utils/mapbox/search";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  Icon?: ReactElement;
}

// const Textbox = (
//   { placeholder }: InputProps,
//   ref: React.Ref<HTMLInputElement>
// ) => {
//   const [isExpand, setIsExpand] = useState<boolean>(false);
//   return (
//     <>
//       <div
//         className="flex w-full flex-row justify-between rounded-lg border-2 border-solid border-transparent bg-neutral-200 py-2.5 pl-3 active:border-black"
//         onClick={() => {
//           setIsExpand(!isExpand);
//         }}
//       >
//         <div className="w-full grow px-4">
//           <input
//             placeholder={placeholder}
//             type="text"
//             className="m-0 w-full text-ellipsis border-none bg-neutral-200 p-0 text-left text-base leading-6 outline-none"
//             ref={ref}
//             autoComplete="off"
//           />
//         </div>
//         <div className="flex items-center pr-3">
//           <IconArrowDropDown viewBox="0 0 24 24" className="h-5 w-5" />
//         </div>
//         {isExpand && (
//           <>
//             <div className="absolute top-20 -ml-3.5 w-[calc(100%-6rem)] rounded-lg bg-white shadow-lg">
//               <div className="mx-3 flex items-center justify-center">
//                 <div className="py-2">
//                   <div className="p-6 text-center text-neutral-300">
//                     No result
//                   </div>
//                   <div className="mt-2">
//                     <Button
//                       Icon={
//                         <IconPlus viewBox="0 0 24 24" className="h-6 w-6" />
//                       }
//                       name="Enter manualy"
//                     ></Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div
//               className="fixed top-0 left-0 h-full w-full"
//               onClick={() => {
//                 setIsExpand(false);
//               }}
//             ></div>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default forwardRef(Textbox);

const search = mapboxSearch("123");
console.log(search);

const people = [
  { id: 1, name: "Wade Cooper" },
  { id: 2, name: "Arlene Mccoy" },
  { id: 3, name: "Devon Webb" },
  { id: 4, name: "Tom Cook" },
  { id: 5, name: "Tanya Fox" },
];

const ComboBox = (
  { placeholder }: InputProps,
  ref: React.Ref<HTMLInputElement>
) => {
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [query, setQuery] = useState("");

  const filteredPeople =
    query === ""
      ? people
      : people.filter((person) => {
          return "";
        });
  return (
    <Combobox value={selectedAddress} onChange={setSelectedAddress}>
      <div className="relative flex w-full flex-row justify-between rounded-lg border-2 border-solid border-transparent bg-neutral-200 py-2.5 pl-3 active:border-black">
        <div className="w-full grow px-4">
          <Combobox.Input
            onChange={(event) => setQuery(event.target.value)}
            className="m-0 w-full text-ellipsis border-none bg-neutral-200 p-0 text-left text-base leading-6 outline-none"
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
            {filteredPeople.length === 0 && query !== "" ? (
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
              filteredPeople.map((person) => (
                <Combobox.Option
                  key={person.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={person}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {person.name}
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

export default forwardRef(ComboBox);
