import { StateCreator } from "zustand";
import { TokenData } from "../types";
interface GlobalState {
  walletAddress: string;
  balance: string;
  bonkBalance: string;
  paid: boolean;
  searchBarValue: string;
  leaderboard: TokenData[];
}

interface GlobalActions {
  setAddress: (walletAddress: string) => void;
  setBalances: (balance: string, bonkBalance: string) => void;
  setPaid: (paid: boolean) => void;
  setSearchBarValue: (searchBarValue: string) => void;
  setLeaderboard: (leaderboard: TokenData[]) => void;
  setTokenData: (tokenId: number, tokenData: TokenData) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  paid: true,
  walletAddress: "",
  balance: "",
  bonkBalance: "",
  searchBarValue: "",
  leaderboard: [],
};

export const createGlobalSlice: StateCreator<
  GlobalSlice,
  [],
  [],
  GlobalSlice
> = (set) => ({
  ...initialGlobalState,
  setPaid: (paid) => set({ paid }),
  setAddress: (walletAddress) => set({ walletAddress }),
  setBalances: (balance, bonkBalance) => set({ balance, bonkBalance }),
  setSearchBarValue: (searchBarValue) => set({ searchBarValue }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setTokenData: (tokenId, tokenData) =>
    set((state) => {
      const updatedLeaderboard = [...state.leaderboard];
      const index = updatedLeaderboard.findIndex(
        (token) => token.id === tokenId
      );

      if (index !== -1) {
        // If token with tokenId exists, update it
        updatedLeaderboard[index] = tokenData;
      } else {
        // Otherwise, add the new tokenData
        updatedLeaderboard.push(tokenData);
      }

      return { leaderboard: updatedLeaderboard };
    }),
});
