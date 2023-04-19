import RestaurantPendingAdminCard from "../common/RestaurantPendingAdminCard";
import ShipperPendingAdminCard from "../common/ShipperPendingAdminCard";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import {
  type Shipper,
  type Restaurant,
  type User,
  type Cuisine,
} from "@prisma/client";
import fuzzysort from "fuzzysort";
import React, { useState } from "react";
import { api } from "~/utils/api";

interface AdminRequestsBodyProps {
  pendingRestaurantAndShipper: (
    | {
        type: "restaurant";
        data: Restaurant & {
          user: User;
          cuisine: Cuisine;
        };
      }
    | {
        type: "shipper";
        data: Shipper & {
          user: User;
        };
      }
  )[];
}

const AdminRequestsBody: React.FC<AdminRequestsBodyProps> = ({
  pendingRestaurantAndShipper,
}) => {
  const [search, setSearch] = useState("");

  const [pendingList, setPendingList] = useState<
    (
      | {
          type: "restaurant";
          data: Restaurant & {
            user: User;
            cuisine: Cuisine;
          };
        }
      | {
          type: "shipper";
          data: Shipper & {
            user: User;
          };
        }
    )[]
  >(pendingRestaurantAndShipper);

  const pendingQuery =
    api.admin.getPendingRestauranntAndShipperRequests.useQuery(undefined, {
      initialData: pendingRestaurantAndShipper,
      refetchInterval: 5000,
      enabled: search === "",
      onSuccess: (data) => {
        if (search === "") setPendingList(data);
      },
    });

  const handleSearch = (query: string) => {
    setSearch(query);
    if (query === "") {
      setPendingList(pendingQuery.data);
      return;
    }
    setPendingList(() => {
      const result = fuzzysort.go(search, pendingQuery.data, {
        keys: ["name"],
        all: true,
      });
      return result.map((pending) => {
        return pending.obj;
      });
    });
  };

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl bg-white">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center bg-virparyasMainBlue px-4">
          <SearchIcon className="h-8 w-8 fill-white" />
        </div>
      </div>
      <div className="mt-4">
        {pendingList.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No registrations found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendingList.map((pending) => {
              if (pending.type === "restaurant") {
                return (
                  <RestaurantPendingAdminCard
                    restaurant={pending.data}
                    pendingList={pendingList}
                    setPendingList={setPendingList}
                    key={pending.data.id}
                  />
                );
              } else {
                return (
                  <ShipperPendingAdminCard
                    shipper={pending.data}
                    pendingList={pendingList}
                    setPendingList={setPendingList}
                    key={pending.data.id}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequestsBody;
