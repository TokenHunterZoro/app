import { createStore } from "zustand";
import { createGlobalSlice, GlobalSlice } from "./globalSlice";
export type EnvironmentStore = GlobalSlice;

export const createEnvironmentStore = () =>
  createStore<EnvironmentStore>()((...a) => ({
    ...createGlobalSlice(...a),
  }));
