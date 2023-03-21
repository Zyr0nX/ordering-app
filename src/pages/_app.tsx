import { Analytics } from '@vercel/analytics/react';
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Roboto } from "next/font/google";
import NextNProgress from "nextjs-progressbar";
import "~/styles/globals.css";
import { api } from "~/utils/api";


const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <main
        className={`${roboto.variable} min-h-screen bg-virparyasBackground font-roboto`}
      >
        <NextNProgress />
        <Component {...pageProps} />
        <Analytics />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);