import { MapboxSearch, SessionToken } from "@mapbox/search-js-core";
import { env } from "../../env/server.mjs";

export const mapboxSearch = async (keyword: string) => {
  const search = new MapboxSearch({ accessToken: env.MAPBOX_TOKEN });

  const sessionToken = new SessionToken();
  const result = await search.suggest(keyword, { sessionToken });
  return result;
};
