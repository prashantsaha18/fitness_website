import { create } from "zustand";
import { ClassifyResult } from "@workspace/api-client-react";

interface AppState {
  lastResult: ClassifyResult | null;
  setLastResult: (result: ClassifyResult | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),
}));
