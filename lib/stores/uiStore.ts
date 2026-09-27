import { create } from "zustand";

type UiState = {
  serverScope: string | "all";
  setServerScope: (id: string | "all") => void;
  /** Selected messaging tenant (string id for URL paths). */
  tenantScope: string | null;
  setTenantScope: (id: string | null) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  serverScope: "all",
  setServerScope: (serverScope) => set({ serverScope }),
  tenantScope: null,
  setTenantScope: (tenantScope) => set({ tenantScope }),
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
