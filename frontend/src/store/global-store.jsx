import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: null,
  setAuthUser: (user) => set({ authUser: user }),
  logout: () => set({ authUser: null ,auctionCode: null}),
  refetch: null, // To store refetch function
  setRefetch: (refetchFn) => set({ refetch: refetchFn }),
  auctionCode: null,
  setAuctionCode: (code) => set({ auctionCode: code }),
}));

