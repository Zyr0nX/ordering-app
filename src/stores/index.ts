import { createId } from "@paralleldrive/cuid2";
import { type inferProcedureOutput } from "@trpc/server";
import { createSelectorFunctions } from "auto-zustand-selectors-hook";
import fuzzysort from "fuzzysort";
import { create } from "zustand";
import { type AppRouter } from "~/server/api/root";


interface HomeState {
  restaurantList: inferProcedureOutput<
    AppRouter["restaurant"]["getAllApproved"]
  >;

  selectedCuisine:
    | inferProcedureOutput<AppRouter["cuisine"]["getAll"]>[number]
    | null;

  searchQuery: string;

  setRestaurantList: (
    restaurantList: inferProcedureOutput<
      AppRouter["restaurant"]["getAllApproved"]
    >
  ) => void;

  selectACuisine: (
    cuisine: inferProcedureOutput<AppRouter["cuisine"]["getAll"]>[number]
  ) => void;

  unselectCuisine: () => void;

  search: (query: string) => void;

  favoriteARestaurant: (restaurantId: string) => void;

  unfavoriteARestaurant: (restaurantId: string) => void;
}

export const useHomeStore = createSelectorFunctions(
  create<HomeState>((set) => ({
    restaurantList: [],
    selectedCuisine: null,
    searchQuery: "",
    setRestaurantList: (restaurantList) => {
      set({ restaurantList });
    },
    selectACuisine: (cuisine) => {
      set({ selectedCuisine: cuisine });
      set((state) => ({
        restaurantList: fuzzysort
          .go(state.searchQuery, state.restaurantList, {
            keys: ["name"],
            all: true,
          })
          .map((restaurant) => {
            return restaurant.obj;
          })
          .filter((restaurant) => {
            if (restaurant.cuisineId === cuisine.id) {
              return true;
            }
            return false;
          }),
      }));
    },
    unselectCuisine: () => {
      set({ selectedCuisine: null });
      set((state) => ({
        restaurantList: fuzzysort
          .go(state.searchQuery, state.restaurantList, {
            keys: ["name"],
            all: true,
          })
          .map((restaurant) => {
            return restaurant.obj;
          }),
      }));
    },
    search: (query) => {
      set({ searchQuery: query });
      set((state) => ({
        restaurantList: fuzzysort
          .go(query, state.restaurantList, {
            keys: ["name"],
            all: true,
          })
          .map((restaurant) => {
            return restaurant.obj;
          }),
      }));
    },
    favoriteARestaurant: (restaurantId) => {
      set((state) => ({
        restaurantList: state.restaurantList.map((r) => {
          if (r.id === restaurantId) {
            return {
              ...r,
              favorite: [
                {
                  id: createId(),
                  restaurantId: r.id,
                  userId: "",
                },
              ],
            };
          }
          return r;
        }),
      }));
    },
    unfavoriteARestaurant: (restaurantId) => {
      set((state) => ({
        restaurantList: state.restaurantList.map((r) => {
          if (r.id === restaurantId) {
            return { ...r, favorite: [] };
          }
          return r;
        }),
      }));
    },
  }))
);