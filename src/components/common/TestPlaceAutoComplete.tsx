import LocationIcon from "../icons/LocationIcon";
import Loading from "./Loading";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Combobox, Transition } from "@headlessui/react";
import { useField, type FieldHookConfig } from "formik";
import { Fragment, HtmlHTMLAttributes, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useDebounce } from "use-debounce";
import { RouterOutputs, api } from "~/utils/api";

interface PlaceAutoCompleteComboboxProps
  extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

const PlaceAutoCompleteCombobox: React.FC<PlaceAutoCompleteComboboxProps> = ({
  label,
  name,
  id,
  ...props
}) => {
  const [field, meta, helper] =
    useField<RouterOutputs["maps"]["getAutocomplete"][number]>(name);

  const [query, setQuery] = useState("");

  const [places, setPlaces] = useState<
    RouterOutputs["maps"]["getAutocomplete"]
  >([]);

  const [debouncedQuery] = useDebounce<string>(query, 500);

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isReverseGeocodeLoading, setIsReverseGeocodeLoading] = useState(false);

  api.maps.getAutocomplete.useQuery(
    { query: debouncedQuery },
    {
      onSuccess: (data) => {
        setPlaces(data);
      },
      onSettled: () => {
        setIsSearchLoading(false);
      },
      enabled: !!debouncedQuery,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const reverseGeocodeMutation = api.maps.getReverseGeocode.useMutation();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value === "") {
      setPlaces([]);
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
  };

  const handleCurrentAddress = async () => {
    if (navigator.geolocation) {
      setIsReverseGeocodeLoading(true);
      let lat: number;
      let lng: number;
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
      });
      await toast.promise(
        reverseGeocodeMutation.mutateAsync(
          {
            lat: lat,
            lng,
          },
          {
            onSuccess: (data) => {
              if (data) {
                helper.setValue({
                  description: data.formatted_address,
                  place_id: data.place_id,
                });
              }
            },
            onSettled: () => {
              setIsReverseGeocodeLoading(false);
            },
          }
        ),
        {
          loading: "Getting your current address...",
          success: "Got your current address!",
          error: "Failed to get your current address.",
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        {meta.error && meta.touched && (
          <p className="text-virparyasRed text-xs">{meta.error}</p>
        )}
      </div>
      <div className="flex gap-2">
        <div className="grow">
          <Combobox
            value={field.value}
            onChange={(value) =>
              field.onChange({
                target: {
                  value: {
                    description: value.description,
                    place_id: value.place_id,
                  },
                  name,
                },
              })
            }
          >
            <div className="relative">
              <Combobox.Input
                className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                  meta.error && meta.touched ? "ring-virparyasRed ring-2" : ""
                }`}
                displayValue={() => field.value.description || ""}
                onChange={(e) => handleSearch(e.target.value)}
                id={id}
                {...props}
              />

              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => setQuery("")}
              >
                <Combobox.Options className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                  {isSearchLoading ? (
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
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"
          onClick={handleCurrentAddress}
        >
          {isReverseGeocodeLoading ? (
            <Loading className="fill-virparyasMainBlue h-6 w-6 animate-spin text-gray-200" />
          ) : (
            <LocationIcon />
          )}
        </button>
      </div>
    </div>
  );
};

export default PlaceAutoCompleteCombobox;
