import { type NextPage } from "next";
import Head from "next/head";

import Header from "../components/ui/Header/Header";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Viparyas | Home</title>
        <meta name="description" content="Vyparyas | Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-full">
        <div className="relative flex h-full min-w-full flex-col">
          <Header />
        </div>
      </div>
    </>
  );
};

export default Home;
