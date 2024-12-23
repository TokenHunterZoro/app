import { StateCreator } from "zustand";
import { LeaderboardData, TokenData } from "../types";
interface GlobalState {
  walletAddress: string;
  balance: string;
  bonkBalance: string;
  paid: boolean;
  searchBarValue: string;
  leaderboard: LeaderboardData[];
  tokens: Record<string, TokenData>;
}

interface GlobalActions {
  setAddress: (walletAddress: string) => void;
  setBalances: (balance: string, bonkBalance: string) => void;
  setPaid: (paid: boolean) => void;
  setSearchBarValue: (searchBarValue: string) => void;
  setLeaderboard: (leaderboard: TokenData[]) => void;
  setToken: (tokenId: number, tokenData: TokenData) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  paid: true,
  walletAddress: "",
  balance: "",
  bonkBalance: "",
  searchBarValue: "",
  leaderboard: [],
  tokens: {},
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
  setToken: (tokenId, tokenData) =>
    set((state) => ({
      tokens: { ...state.tokens, [tokenId]: tokenData },
    })),
});
