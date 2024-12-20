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
  setLeaderboad: (leaderboard: TokenData[]) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  paid: false,
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
  setLeaderboad: (leaderboard) => set({ leaderboard }),
});
