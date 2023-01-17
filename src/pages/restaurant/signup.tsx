import Head from "next/head";
import React from "react";
import RestaurantSignUp from "../../components/ui/Forms/RestaurantSignUp";
import Header from "../../components/ui/Header";

const signup = () => {
  return (
    <>
      <Head>
        <title>Viparyas | Home</title>
        <meta name="description" content="Vyparyas | Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="absolute z-10 flex h-full w-full flex-col">
        <Header />
      </div>
      <div className="absolute h-full w-full bg-[url(https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_1640,h_851/v1658225144/assets/30/7d0851-aad0-4583-a029-f339b38a1a9f/original/SSU_hero_2.png)] bg-cover bg-no-repeat "></div>
      <div className="relative right-10 w-[50rem] bg-white">
        <RestaurantSignUp />
      </div>
    </>
  );
};

export default signup;
