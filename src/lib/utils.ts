import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer amount to Vietnamese Dong currency display (e.g. 500.000 ₫)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format standard date in Vietnamese format (dd/MM/yyyy)
 */
export function formatDateVN(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy", { locale: vi });
}

/**
 * Format date time in Vietnamese format (HH:mm dd/MM/yyyy)
 */
export function formatDateTimeVN(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm dd/MM/yyyy", { locale: vi });
}

/**
 * Format phone number safely for public display (e.g. 098****321)
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || phone.length < 7) return "";
  return phone.slice(0, 3) + "****" + phone.slice(-3);
}
