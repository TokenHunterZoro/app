"use client";

import { createEnvironmentStore, type EnvironmentStore } from "@/lib/store";
import { createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type EnvironmentStoreApi = ReturnType<typeof createEnvironmentStore>;

export const EnvironmentStoreContext = createContext<
  EnvironmentStoreApi | undefined
>(undefined);

export const EnvironmentStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<EnvironmentStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createEnvironmentStore();
  }

  return (
    <EnvironmentStoreContext.Provider value={storeRef.current}>
      {children}
    </EnvironmentStoreContext.Provider>
  );
};

export const useEnvironmentStore = <T,>(
  selector: (store: EnvironmentStore) => T
): T => {
  const environmentStoreContext = useContext(EnvironmentStoreContext);
  if (!environmentStoreContext) {
    throw new Error(
      "useEnvironmentStore must be used within a EnvironmentStoreProvider"
    );
  }
  return useStore(environmentStoreContext, selector);
};
