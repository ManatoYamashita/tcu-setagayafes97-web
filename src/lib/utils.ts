import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * className のマージユーティリティ
 * Tailwind CSS のクラス名を適切にマージする
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
