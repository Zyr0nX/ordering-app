import Head from "next/head";
import type { ReactElement } from "react";
import React from "react";

export default function Admin({ children }: { children: ReactElement }) {
  return (
    <>
      <Head>
        <title>Virparyas</title>
        <meta name="description" content="Virparyas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {children}
    </>
  );
}
