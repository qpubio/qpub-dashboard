import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNum(n: number | undefined) {
  if (n === undefined) return "—";
  return new Intl.NumberFormat().format(n);
}
