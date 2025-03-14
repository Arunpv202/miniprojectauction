import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      setAuthUser: (user) => set({ authUser: user }),
      logout: () => set({ authUser: null, auctionCode: null, socketid: null }),
      refetch: null, // To store refetch function
      setRefetch: (refetchFn) => set({ refetch: refetchFn }),
      auctionCode: null,
      setAuctionCode: (code) => set({ auctionCode: code }),
      socketid: null,
      setSocketid: (socketid) => set({ socketid }),
      Teamname: null,
      setTeamname: (teamname) => set({ Teamname: teamname }),
    }),
    { name: "auth-storage" } // Saves to localStorage
  )
);

