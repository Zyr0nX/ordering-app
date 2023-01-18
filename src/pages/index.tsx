import { type NextPage } from "next";
import Head from "next/head";

import CategoryBar from "../components/common/Category/CategoryBar";
import ProductCard from "../components/common/Product/ProductCard";
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
        <CategoryBar />
        <ProductCard />
      </div>
    </>
  );
};

export default Home;
