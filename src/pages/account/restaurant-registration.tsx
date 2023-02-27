import { type GetServerSidePropsContext } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";
import { type CountryCode } from "~/utils/types";

export const getServerSideProps = ({ country }: CountryCode) => {
  return {
    props: {
      country,
    },
  };
};

const RestaurantRegistration = ({ country }: CountryCode) => {
  console.log("country", country);
  return (
    <Guest>
      <>
        <GuestCommonHeader />
        <RestaurantRegistrationForm country={country} />
      </>
    </Guest>
  );
};

export default RestaurantRegistration;
