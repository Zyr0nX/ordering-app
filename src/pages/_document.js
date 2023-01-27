import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          defer
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBL-dxStYftZJ8wDgr2CmPMZxSNl6OnXuo&libraries=places&callback=Function.prototype"
          strategy="beforeInteractive"
        ></Script>
      </body>
    </Html>
  );
}
