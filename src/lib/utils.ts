import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, de-duplicating conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as INR currency without decimals. */
export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an ISO date string as e.g. "12 Mar 2026". */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function _twoDigits(n: number): string {
  if (n < 20) return ONES[n] ?? "";
  return (TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "")).trim();
}
function _threeDigits(n: number): string {
  if (n < 100) return _twoDigits(n);
  return (ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + _twoDigits(n % 100) : "")).trim();
}

/** Convert a positive integer to Indian-English words (Crore / Lakh / Thousand). */
export function numberToWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  n = Math.floor(n);
  if (n === 0) return "Zero Rupees";
  const parts: string[] = [];
  if (n >= 10_000_000) { parts.push(_threeDigits(Math.floor(n / 10_000_000)) + " Crore"); n %= 10_000_000; }
  if (n >= 100_000)    { parts.push(_twoDigits(Math.floor(n / 100_000)) + " Lakh"); n %= 100_000; }
  if (n >= 1_000)      { parts.push(_twoDigits(Math.floor(n / 1_000)) + " Thousand"); n %= 1_000; }
  if (n > 0)           { parts.push(_threeDigits(n)); }
  return parts.join(" ") + " Rupees";
}

/** Parse a budget string (e.g. "₹200000", "2,00,000", "200000") into a number, or null. */
export function parseBudgetNumber(val: string): number | null {
  const cleaned = val.replace(/[₹,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Short, deterministic initials from a full name. */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
