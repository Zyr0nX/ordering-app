import { type GetServerSidePropsContext } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";
import { type CountryCode } from "~/utils/types";

const RestaurantRegistration = ({ country }: CountryCode) => {
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

export const getServerSideProps = (context: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  console.log("context.req.headers", context.req);
  const country = context.req.headers["x-country"];

  return {
    props: { country: country },
  };
};
