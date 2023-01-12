import { config, useConfirmAddress } from "@mapbox/search-js-react";
import { PrismaClient } from "@prisma/client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { publicProcedure, router } from "../../../server/trpc/trpc";
import { trpc } from "../../../utils/trpc";
import Button from "../../common/FormElement/Button";
import ComboBox from "../../common/FormElement/ComboBox";
import Textbox from "../../common/FormElement/Textbox";

const RestaurantSignUp = () => {
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

  const name = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const additionalAddress = useRef<HTMLInputElement>(null);
  const firstName = useRef<HTMLInputElement>(null);
  const lastName = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const phoneNumber = useRef<HTMLInputElement>(null);

  const mutation = trpc.restaurant.sendrestaurantinfo.useMutation();
  const sendRestaurantInfo = () => {
    if (!name.current?.value) {
      setIsValidName(false);
      return;
    }
    if (!address.current?.value) {
      setIsValidAddress(false);
      return;
    }
    if (!firstName.current?.value) {
      setIsValidFirstName(false);
      return;
    }
    if (!lastName.current?.value) {
      setIsValidLastName(false);
      return;
    }
    if (!email.current?.value) {
      setIsValidEmail(false);
      return;
    }
    if (!phoneNumber.current?.value) {
      setIsValidPhoneNumber(false);
      return;
    }

    mutation.mutate({
      name: name.current?.value,
      address: address.current?.value,
      additionaladdress: additionalAddress.current?.value,
      firstname: firstName.current?.value,
      lastname: lastName.current?.value,
      email: email.current?.value,
      phonenumber: phoneNumber.current?.value,
    });
  };
  const [showFormExpanded, setShowFormExpanded] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [feature, setFeature] = useState();
  const [showValidationText, setShowValidationText] = useState(false);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const accessToken = env.MAPBOX_ACCESS_TOKEN;
    setToken(accessToken);
    config.accessToken = accessToken;
  }, []);

  const { formRef, showConfirm } = useConfirmAddress({
    minimap: true,
    skipConfirmModal: (feature) =>
      ["exact", "high"].includes(feature.properties.match_code.confidence),
  });

  const handleRetrieve = useCallback(
    (res: { features: never[] }) => {
      const feature = res.features[0];
      setFeature(feature);
      setShowMinimap(true);
      setShowFormExpanded(true);
    },
    [setFeature, setShowMinimap]
  );

  function handleSaveMarkerLocation(coordinate: string) {
    console.log(`Marker moved to ${JSON.stringify(coordinate)}.`);
  }

  return (
    <div className="p-12">
      <div className="flex">
        <h2 className="text-2xl font-bold">Get Started</h2>
      </div>
      <div className="mb-2">
        <ComboBox placeholder="Store name" />
      </div>
      <div className="mb-2">
        <Textbox placeholder="Store name" ref={name} />
      </div>
      {isValidName != null && !isValidName && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The name you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <Textbox placeholder="Store address" ref={address} />
      </div>
      {isValidAddress != null && !isValidAddress && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The address you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <Textbox
          placeholder="Floor / Suite (Optional)"
          ref={additionalAddress}
        />
      </div>
      <div className="mt-6 flex">
        <div className="mr-2 w-1/2">
          <div className="mb-2">
            <Textbox placeholder="First name" ref={firstName} />
          </div>
          {isValidFirstName != null && !isValidFirstName && (
            <p className="pt-2 text-xs leading-4 text-red-500">
              The name you entered is invalid.
            </p>
          )}
        </div>
        <div className="w-1/2">
          <div className="mb-2">
            <Textbox placeholder="Last name" ref={lastName} />
          </div>
          {isValidLastName != null && !isValidLastName && (
            <p className="pt-2 text-xs leading-4 text-red-500">
              The name you entered is invalid.
            </p>
          )}
        </div>
      </div>
      <div className="mb-2">
        <Textbox placeholder="Email" ref={email} />
      </div>
      {isValidEmail != null && !isValidEmail && (
        <p className="pt-2 text-xs leading-4 text-red-500">
          The email you entered is invalid.
        </p>
      )}
      <div className="mb-2">
        <Textbox placeholder="Phone number" ref={phoneNumber} />
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
