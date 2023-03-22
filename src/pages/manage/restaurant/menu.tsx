import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Restaurant from "~/components/layouts/Restaurant";
import ManageRestaurantHeader from "~/components/ui/ManageRestaurantHeader";
import ManageRestaurantMenuBody from "~/components/ui/ManageRestaurantMenuBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Requests = () => {
  return (
    <Restaurant>
      <>
        <ManageRestaurantHeader title="Menu" />
        <ManageRestaurantMenuBody />
      </>
    </Restaurant>
  );
};

export default Requests;