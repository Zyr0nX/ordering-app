import Head from "next/head";
import { type ReactElement, useEffect } from "react";
import React from "react";
import { useThrottledCallback } from "use-debounce";
import { api } from "~/utils/api";

export default function Shipper({ children }: { children: ReactElement }) {
  const updateLocationMutatation = api.shipper.updateLocation.useMutation();

  const updateLocationMutateThrottled = useThrottledCallback(
    (position: GeolocationPosition) => {
      updateLocationMutatation.mutate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    10000,
    { trailing: true }
  );

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      updateLocationMutateThrottled
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [updateLocationMutateThrottled]);

  return (
    <>
      <Head>
        <title>Shipper Panel</title>
        <meta name="description" content="Shipper Panel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {children}
    </>
  );
}
