import { create } from "zustand";

type UiState = {
  serverScope: string | "all";
  setServerScope: (id: string | "all") => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  serverScope: "all",
  setServerScope: (serverScope) => set({ serverScope }),
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
