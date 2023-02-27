import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";
import { type CountryCodes } from "~/utils/types";

export const getServerSideProps = ({ query }: { query: CountryCodes }) => {
  return {
    props: {
      query,
    },
  };
};

const RestaurantRegistration = ({ query }: { query: CountryCodes }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader />
        <RestaurantRegistrationForm country={query} />
      </>
    </Guest>
  );
};

export default RestaurantRegistration;
