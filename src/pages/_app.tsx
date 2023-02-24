// import "@fortawesome/fontawesome-free/css/all.min.css";
// import { Poppins } from "@next/font/google";
// import { type Session } from "next-auth";
// import { SessionProvider } from "next-auth/react";
// import { type AppType } from "next/app";
// import "../styles/globals.css";
// import { trpc } from "../utils/api";
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   variable: "--font-poppins",
// });
// const MyApp: AppType<{ session: Session | null }> = ({
//   Component,
//   pageProps: { session, ...pageProps },
// }) => {
//   return (
//     <SessionProvider session={session}>
//       <main className={`${poppins.variable} font-sans`}>
//         <Component {...pageProps} />
//       </main>
//     </SessionProvider>
//   );
// };
// export default trpc.withTRPC(MyApp);
import { Roboto } from "@next/font/google";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
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
      <main className={`${roboto.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
