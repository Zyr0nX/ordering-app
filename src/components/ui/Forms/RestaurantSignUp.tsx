import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Script from "next/script";
import React, { useEffect, useRef, useState } from "react";

import type { Feature, MapboxPlaces } from "../../../types/mapbox-places";
import { trpc } from "../../../utils/trpc";
import useInput from "../../../utils/useInput";
import { useMapboxSearch } from "../../../utils/useMapboxSearch";
import Button from "../../common/FormElement/Button";
import ComboBox from "../../common/FormElement/ComboBox";
import { PlacesAutocomplete } from "../../common/FormElement/PlacesAutocomplete";
import Textbox from "../../common/FormElement/Textbox";

const RestaurantSignUp = () => {
  const userId = useSession().data?.user?.id || "";

  const name = useInput("");
  const [address, setAddress] = useState<Feature>();
  console.log(address);
  const additionalAddress = useInput("");
  const firstName = useInput("");
  const lastName = useInput("");
  const email = useInput("");
  const phoneNumber = useInput("");

  const [isValidName, setIsValidName] = useState<boolean | null>(null);
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const [isValidFirstName, setIsValidFirstName] = useState<boolean | null>(
    null
  );
  const [isValidLastName, setIsValidLastName] = useState<boolean | null>(null);
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean | null>(
    null
  );

  const mutation = trpc.restaurant.sendrestaurantinfo.useMutation();

  const sendRestaurantInfo = () => {
    if (!name) {
      setIsValidName(false);
      return;
    }
    if (!address) {
      setIsValidAddress(false);
      return;
    }
    if (!firstName) {
      setIsValidFirstName(false);
      return;
    }
    if (!lastName) {
      setIsValidLastName(false);
      return;
    }
    if (!email) {
      setIsValidEmail(false);
      return;
    }
    if (!phoneNumber) {
      setIsValidPhoneNumber(false);
      return;
    }

    mutation.mutate({
      name: name.value,
      address: address.place_name ?? "",
      additionaladdress: additionalAddress.value,
      firstname: firstName.value,
      lastname: lastName.value,
      email: email.value,
      phonenumber: phoneNumber.value,
      userId: userId,
    });
  };

  return (
    <div className="p-12">
      <h2 className="text-2xl font-bold">Get Started</h2>

      <PlacesAutocomplete />
      <div className="mb-2">
        <Textbox
          placeholder="Store name"
          value={name.value}
          onChange={name.onChange}
        />
      </div>
      {isValidName != null && !isValidName && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The name you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <ComboBox
          placeholder="Test"
          value={address?.place_name || ""}
          a={setAddress}
        />
        {/* <Textbox
          placeholder="Store address"
          value={address.value}
          onChange={address.onChange}
        /> */}
      </div>
      {isValidAddress != null && !isValidAddress && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The address you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <Textbox
          placeholder="Floor / Suite (Optional)"
          value={additionalAddress.value}
          onChange={additionalAddress.onChange}
        />
      </div>
      <div className="mt-6 flex">
        <div className="mr-2 w-1/2">
          <div className="mb-2">
            <Textbox
              placeholder="First name"
              value={firstName.value}
              onChange={firstName.onChange}
            />
          </div>
          {isValidFirstName != null && !isValidFirstName && (
            <p className="pt-2 text-xs leading-4 text-red-500">
              The name you entered is invalid.
            </p>
          )}
        </div>
        <div className="w-1/2">
          <div className="mb-2">
            <Textbox
              placeholder="Last name"
              value={lastName.value}
              onChange={lastName.onChange}
            />
          </div>
          {isValidLastName != null && !isValidLastName && (
            <p className="pt-2 text-xs leading-4 text-red-500">
              The name you entered is invalid.
            </p>
          )}
        </div>
      </div>
      <div className="mb-2">
        <Textbox
          placeholder="Email"
          value={email.value}
          onChange={email.onChange}
        />
      </div>
      {isValidEmail != null && !isValidEmail && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The email you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <Textbox
          placeholder="Phone number"
          value={phoneNumber.value}
          onChange={phoneNumber.onChange}
        />
      </div>
      {isValidPhoneNumber != null && !isValidPhoneNumber && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The number you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <Button
          backgroundColor="black"
          name="Submit"
          onClick={sendRestaurantInfo}
        />
      </div>
    </div>
  );
};

export default RestaurantSignUp;
