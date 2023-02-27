import { type GetServerSidePropsContext } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";
import { type CountryCode } from "~/utils/types";

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

export const getServerSideProps = ({ country }: CountryCode) => ({
  props: country,
});
