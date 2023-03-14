import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";

export const getServerSideProps = ({ query }: { query: string }) => {
  return {
    props: {
      query,
    },
  };
};

const RestaurantRegistration = ({ query }: { query: { country: string } }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Restaurant Registration" />
        <RestaurantRegistrationForm country={query.country} />
      </>
    </Guest>
  );
};

export default RestaurantRegistration;
