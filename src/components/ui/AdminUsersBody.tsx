import UserAdminCard from "../common/UserAdminCard";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import { type User } from "@prisma/client";
import fuzzysort from "fuzzysort";
import React, { useState } from "react";
import { api } from "~/utils/api";

const AdminUsersBody = ({ users }: { users: User[] }) => {
  const [search, setSearch] = useState("");

  const [userList, setUserList] = useState<User[]>(users);

  const userQuery = api.admin.getUsers.useQuery(undefined, {
    initialData: users,
    refetchInterval: 5000,
    enabled: search === "",
    onSuccess: (data) => {
      if (search === "") setUserList(data);
    },
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    if (query === "") {
      setUserList(userQuery.data);
      return;
    }
    setUserList(() => {
      const result = fuzzysort.go(search, userQuery.data, {
        keys: ["name", "email"],
        all: true,
      });
      return result.map((user) => {
        return user.obj;
      });
    });
  };

  return (
    <div className="text-virparyasMainBlue m-4">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl bg-white">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="bg-virparyasMainBlue flex items-center px-4">
          <SearchIcon className="h-8 w-8 fill-white" />
        </div>
      </div>
      <div className="mt-4">
        {userList.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No shipper found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {userList.map((user) => (
              <UserAdminCard
                user={user}
                userList={userList}
                setUserList={setUserList}
                key={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersBody;
