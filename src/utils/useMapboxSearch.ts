import { useQuery } from "@tanstack/react-query";

import type { MapboxPlaces } from "../types/mapbox-places";

export const useMapboxSearch = async (
  keyword: string
): Promise<MapboxPlaces> => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["mapboxSearch", keyword],
    queryFn: () =>
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${keyword}.json?&access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg`
      ).then((res) => res.json()),
  });

  // if (isLoading) return 0;

  // if (error) return -1;

  return data;
};
