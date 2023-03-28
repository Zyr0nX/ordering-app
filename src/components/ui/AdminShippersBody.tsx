import ShipperAdminCard from "../common/ShipperAdminCard";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import { type User, type Shipper } from "@prisma/client";
import fuzzysort from "fuzzysort";
import React, { useState } from "react";
import { api } from "~/utils/api";

interface AdminShippersBodyProps {
  shippers: (Shipper & {
    user: User;
  })[];
}

const AdminShippersBody: React.FC<AdminShippersBodyProps> = ({ shippers }) => {
  const [search, setSearch] = useState("");

  const [shipperList, setShipperList] = useState<
    (Shipper & {
      user: User;
    })[]
  >(shippers);

  const shipperQuery = api.admin.getApprovedShippers.useQuery(undefined, {
    initialData: shippers,
    refetchInterval: 5000,
    enabled: search === "",
    onSuccess: (data) => {
      if (search === "") setShipperList(data);
    },
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    if (query === "") {
      setShipperList(shipperQuery.data);
      return;
    }
    setShipperList(() => {
      const result = fuzzysort.go(search, shipperQuery.data, {
        keys: ["firstName", "lastName"],
        all: true,
      });
      return result.map((shipper) => {
        return shipper.obj;
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
        {shipperList.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No shipper found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {shipperList.map((shipper) => (
              <ShipperAdminCard
                shipper={shipper}
                shipperList={shipperList}
                setShipperList={setShipperList}
                key={shipper.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminShippersBody;
