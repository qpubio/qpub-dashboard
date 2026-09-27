import type { Config } from "tailwindcss";
import quiPreset from "@qpub/qui/tailwind-preset";

const config: Config = {
  presets: [quiPreset],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@qpub/qui/dist/**/*.{js,mjs}",
  ],
};

export default config;
