import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseCSV = (content: string): string[][] => {
  return content
    .trim()
    .split("\n")
    .map((line) => line.split(",")); // Splits lines into rows and cells into columns
};
