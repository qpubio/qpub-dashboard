import { create } from "zustand";

export type ConsoleMode = "channel" | "queue";

interface ConsoleControlsStore {
  mode: ConsoleMode;
  channelName: string;
  queueName: string;
  eventName: string;
  setMode: (mode: ConsoleMode) => void;
  setChannelName: (name: string) => void;
  setQueueName: (name: string) => void;
  setEventName: (name: string) => void;
}

export const useConsoleControlsStore = create<ConsoleControlsStore>((set) => ({
  mode: "channel",
  channelName: "my-channel",
  queueName: "my-queue",
  eventName: "",
  setMode: (mode) => set({ mode }),
  setChannelName: (name) => set({ channelName: name }),
  setQueueName: (name) => set({ queueName: name }),
  setEventName: (name) => set({ eventName: name }),
}));
