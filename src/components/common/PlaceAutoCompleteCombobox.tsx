import LocationIcon from "../icons/LocationIcon";
import Loading from "./Loading";
import { Combobox, Transition } from "@headlessui/react";
import { useField } from "formik";
import { Fragment, type HtmlHTMLAttributes, useState, useId } from "react";
import { toast } from "react-hot-toast";
import { useDebounce } from "use-debounce";
import { type RouterOutputs, api } from "~/utils/api";

interface PlaceAutoCompleteComboboxProps
  extends HtmlHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  enableCurrentAddress?: boolean;
}

const PlaceAutoCompleteCombobox: React.FC<PlaceAutoCompleteComboboxProps> = ({
  label,
  name,
  id,
  enableCurrentAddress = true,
  ...props
}) => {
  const mapsAutoCompleteSession = useId();
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
    { query: debouncedQuery, sessionToken: mapsAutoCompleteSession },
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

  function getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  const handleCurrentAddress = async () => {
    if (navigator.geolocation) {
      setIsReverseGeocodeLoading(true);
      await toast.promise(
        (async () => {
          const { coords } = await getPosition();
          await reverseGeocodeMutation.mutateAsync(
            {
              lat: coords.latitude,
              lng: coords.longitude,
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
          );
        })(),
        {
          loading: "Getting your current address...",
          success: "Got your current address!",
          error:
            reverseGeocodeMutation.error?.message ||
            "Failed to get your current address.",
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
              <div className="flex gap-2">
                <Combobox.Input
                  className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                    meta.error && meta.touched ? "ring-2 ring-virparyasRed" : ""
                  }`}
                  displayValue={() => field.value.description || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  id={id}
                  {...props}
                />
                {enableCurrentAddress && (
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"
                    onClick={() => void handleCurrentAddress()}
                  >
                    {isReverseGeocodeLoading ? (
                      <Loading className="h-6 w-6 animate-spin fill-virparyasMainBlue text-gray-200" />
                    ) : (
                      <LocationIcon />
                    )}
                  </button>
                )}
              </div>

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
      </div>
    </div>
  );
};

export default PlaceAutoCompleteCombobox;
