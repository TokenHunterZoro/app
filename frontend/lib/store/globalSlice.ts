import { StateCreator } from "zustand";
interface GlobalState {
  walletAddress: string;
  balance: string;
  bonkBalance: string;
  paid: boolean;
}

interface GlobalActions {
  setAddress: (walletAddress: string) => void;
  setBalances: (balance: string, bonkBalance: string) => void;
  setPaid: (paid: boolean) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  paid: true,
  walletAddress: "",
  balance: "",
  bonkBalance: "",
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
});
