import DropDownIcon from "../icons/DropDownIcon";
import Loading from "./Loading";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Combobox, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { api } from "~/utils/api";
import { useDebounce } from "~/utils/useDebounce";

interface PlaceAutoCompleteComboboxProps {
  placeAutocomplete: PlaceAutocompleteResult | null;
  setPlaceAutocomplete: React.Dispatch<
    React.SetStateAction<PlaceAutocompleteResult>
  >;
  isInvalidAddress: boolean | null;
}

const PlaceAutoCompleteCombobox: React.FC<PlaceAutoCompleteComboboxProps> = ({
  placeAutocomplete,
  setPlaceAutocomplete,
  isInvalidAddress,
}) => {
  const [query, setQuery] = useState("");

  const [places, setPlaces] = useState<PlaceAutocompleteResult[]>([]);

  const debouncedQuery = useDebounce<string>(query, 500);

  const [isLoading, setIsLoading] = useState(false);

  api.maps.getAutocomplete.useQuery(
    { query: debouncedQuery },
    {
      enabled: !!debouncedQuery,
      onSuccess: (data) => {
        setPlaces(data || []);
      },
      onSettled: () => {
        setIsLoading(false);
      },
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value === "") {
      setPlaces([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
  };

  return (
    <Combobox value={placeAutocomplete} onChange={setPlaceAutocomplete}>
      <div className="relative">
        <Combobox.Input
          className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
            isInvalidAddress ? "ring-virparyasRed ring-2" : ""
          }`}
          displayValue={() => placeAutocomplete?.description || ""}
          onChange={(e) => void handleSearch(e.target.value)}
          placeholder="Fill your address here..."
        />

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
            {isLoading ? (
              <div className="relative flex h-32 items-center justify-center">
                <Loading className="fill-virparyasMainBlue h-12 w-12 animate-spin text-gray-200" />
              </div>
            ) : places.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              places.map((place) => (
                <Combobox.Option
                  key={place.place_id}
                  className={({ active }) =>
                    `text-viparyasDarkBlue relative cursor-default select-none ${
                      active ? "bg-[#E9E9FF]" : "text-gray-900"
                    }`
                  }
                  value={place}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate px-4 py-2 ${
                          selected
                            ? "bg-virparyasMainBlue font-semibold text-white"
                            : ""
                        }`}
                      >
                        {place.description}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        ></span>
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

export default PlaceAutoCompleteCombobox;
