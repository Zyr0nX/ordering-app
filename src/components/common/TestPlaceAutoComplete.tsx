import LocationIcon from "../icons/LocationIcon";
import Loading from "./Loading";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Combobox, Transition } from "@headlessui/react";
import { useField, type FieldHookConfig } from "formik";
import { Fragment, HtmlHTMLAttributes, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { api } from "~/utils/api";

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
    useField<Pick<PlaceAutocompleteResult, "description" | "place_id">>(name);
  const coordinates = useRef<{
    lat: number | null;
    lng: number | null;
  }>();

  const [query, setQuery] = useState("");

  const [places, setPlaces] = useState<
    Pick<PlaceAutocompleteResult, "description" | "place_id">[]
  >([]);

  const [debouncedQuery] = useDebounce<string>(query, 500);

  const [isLoading, setIsLoading] = useState(false);

  api.maps.getAutocomplete.useQuery(
    { query: debouncedQuery },
    {
      onSuccess: (data) => {
        setPlaces(data);
      },
      onSettled: () => {
        setIsLoading(false);
      },
      enabled: !!debouncedQuery,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  api.maps.getReverseGeocode.useQuery(
    {
      query: `${
        coordinates.current?.lat && coordinates.current?.lng
          ? `${coordinates.current?.lat},${coordinates.current?.lng}`
          : ""
      }`,
    },
    {
      enabled: !!coordinates.current?.lat && !!coordinates.current?.lng,
      onSuccess: (data) => {
        if (!data) return;
        helper.setValue({
          description: data.formatted_address,
          place_id: data.place_id,
        });
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
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

  const handleCurrentAddress = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        coordinates.current = { lat: latitude, lng: longitude };
        console.log("coordinates.current", coordinates.current);
      });
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
          <p className="text-xs text-virparyasRed">{meta.error}</p>
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
                className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                  meta.error && meta.touched ? "ring-2 ring-virparyasRed" : ""
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
                  {isLoading ? (
                    <div className="relative flex h-32 items-center justify-center">
                      <Loading className="h-12 w-12 animate-spin fill-virparyasMainBlue text-gray-200" />
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
                          `relative cursor-default select-none text-viparyasDarkBlue ${
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
          <LocationIcon />
        </button>
      </div>
    </div>
  );
};

export default PlaceAutoCompleteCombobox;
