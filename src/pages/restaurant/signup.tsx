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
      <div className="absolute flex w-full flex-col">
        <Header />
      </div>
      <div className="absolute -z-10 flex h-full w-full items-center bg-[url(https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,w_1640,h_851/v1658225144/assets/30/7d0851-aad0-4583-a029-f339b38a1a9f/original/SSU_hero_2.png)] bg-cover bg-no-repeat">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-12 gap-9">
            <div className="col-span-6 self-center">
              <div className="mb-8 text-5xl font-bold text-white">
                Unlock a new revenue stream
              </div>
              <p className="text-white">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Corporis recusandae corrupti cupiditate eaque libero ducimus,
                praesentium laudantium labore voluptatibus dolore, pariatur,
                consequuntur accusantium quos sequi fugit! Animi porro cum
                inventore.
              </p>
            </div>
            <div className="col-span-6 bg-white py-32">
              <RestaurantSignUp />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default signup;
