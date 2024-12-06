import { StateCreator } from "zustand";
interface GlobalState {
  showConnectModal: boolean;
  showSupportModal: boolean;
  showPayModal: boolean;
}

interface GlobalActions {
  setShowConnectModal: (showConnectModal: boolean) => void;
  setShowSupportModal: (showSupportModal: boolean) => void;
  setShowPayModal: (showPayModal: boolean) => void;
}

export type GlobalSlice = GlobalState & GlobalActions;

export const initialGlobalState: GlobalState = {
  showConnectModal: false,
  showSupportModal: false,
  showPayModal: false,
};

export const createGlobalSlice: StateCreator<
  GlobalSlice,
  [],
  [],
  GlobalSlice
> = (set) => ({
  ...initialGlobalState,
  setShowConnectModal: (showConnectModal) => set({ showConnectModal }),
  setShowSupportModal: (showSupportModal) => set({ showSupportModal }),
  setShowPayModal: (showPayModal) => set({ showPayModal }),
});
