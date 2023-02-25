import { type NextPage } from "next";
import { signOut } from "next-auth/react";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Viparyas | Home</title>
        <meta name="description" content="Vyparyas | Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button onClick={() => signOut()}>Log out</button>
    </>
  );
};

export default Home;
