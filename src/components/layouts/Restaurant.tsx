import Head from "next/head";
import type { ReactElement } from "react";
import React from "react";

export default function Restaurant({ children }: { children: ReactElement }) {
  return (
    <>
      <Head>
        <title>Restaurant Panel</title>
        <meta name="description" content="Restaurant Panel - Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {children}
    </>
  );
}
