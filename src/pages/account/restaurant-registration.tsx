import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";

const RestaurantRegistration = () => {
  return (
    <Guest>
      <>
        <GuestCommonHeader />
        <RestaurantRegistrationForm />
      </>
    </Guest>
  );
};

export default RestaurantRegistration;
