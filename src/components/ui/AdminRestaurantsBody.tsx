import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import { type Restaurant } from "@prisma/client";
import React, { useState } from "react";
import { api } from "~/utils/api";

const AdminRestaurantsBody = () => {
  const [pendingList, setPendingList] = useState<
    (Restaurant & { user: { email: string | null } | null })[]
  >([]);

  const pendingRestaurantRequestsQuery =
    api.admin.getPendingRestaurantRequests.useQuery(undefined, {
      onSuccess: (data) => {
        setPendingList(data);
      },
      refetchInterval: 5000,
    });

  const approveRestaurantMutation = api.admin.approveRestaurant.useMutation({
    onSuccess: () => pendingRestaurantRequestsQuery.refetch(),
  });
  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onSuccess: () => pendingRestaurantRequestsQuery.refetch(),
  });

  const handleApprove = (id: string) => {
    approveRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleReject = (id: string) => {
    rejectRestaurantMutation.mutate({ restaurantId: id });
  };
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pendingList.map((restaurant) => (
            <div
              key={restaurant.id}
              className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)]"
            >
              <div className="flex w-full items-center justify-between">
                <div className="text-virparyasMainBlue">
                  <p className="text-xl font-medium md:mt-2 md:text-3xl">
                    {restaurant.name}
                  </p>
                  <p className="text-xs font-light md:mb-2 md:text-base">
                    Restaurant
                  </p>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    className="mr-2"
                    onClick={() => handleApprove(restaurant.id)}
                  >
                    <GreenCheckmark className="md:h-10 md:w-10" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(restaurant.id)}
                  >
                    <RedCross className="md:h-10 md:w-10" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantsBody;
