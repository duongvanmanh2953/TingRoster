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
 * Format amount with compact suffix (e.g. 150k, 1.5M, 2.4B)
 */
export function formatCompactVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) return "0 ₫";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, "");
    return `${sign}${val}B ₫`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toFixed(1).replace(/\.0$/, "");
    return `${sign}${val}M ₫`;
  }
  if (abs >= 1_000) {
    const val = (abs / 1_000).toFixed(1).replace(/\.0$/, "");
    return `${sign}${val}k ₫`;
  }
  return `${sign}${abs} ₫`;
}

/**
 * Format standard number with thousand dots separator (e.g. 1.250.000)
 */
export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
}

/**
 * Format compact number without currency (e.g. 1.2k, 15M, 2B)
 */
export function formatCompactNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined || value === 0) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${sign}${abs}`;
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

/**
 * Convert numerical VND amount into official Vietnamese words for accounting and legal receipts.
 * E.g. 1200000 -> "Một triệu hai trăm nghìn đồng chẵn"
 */
export function numberToVietnameseWords(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined || amount === 0) {
    return "Không đồng chẵn";
  }

  const num = Math.abs(Math.round(amount));
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  function readGroupOfThree(threeDigits: number, isHighestGroup: boolean): string {
    const hundred = Math.floor(threeDigits / 100);
    const ten = Math.floor((threeDigits % 100) / 10);
    const unit = threeDigits % 10;
    let res = "";

    if (hundred > 0 || !isHighestGroup) {
      res += digits[hundred] + " trăm ";
      if (ten === 0 && unit > 0) {
        res += "lẻ ";
      }
    }

    if (ten > 0 && ten !== 1) {
      res += digits[ten] + " mươi ";
      if (unit === 1) res += "mốt ";
    } else if (ten === 1) {
      res += "mười ";
      if (unit === 1) res += "một ";
    }

    if (unit === 5 && ten >= 1) {
      res += "lăm ";
    } else if (unit > 0 && (ten > 1 || ten === 0 && (hundred > 0 || !isHighestGroup))) {
      if (unit !== 1 || ten === 0) {
        res += digits[unit] + " ";
      }
    } else if (unit > 0 && ten === 1) {
      if (unit !== 1) res += digits[unit] + " ";
    }

    return res.trim();
  }

  const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
  let numStr = num.toString();
  const groups: number[] = [];

  while (numStr.length > 0) {
    const chunk = numStr.slice(-3);
    groups.push(parseInt(chunk, 10));
    numStr = numStr.slice(0, -3);
  }

  let words = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const isHighest = i === groups.length - 1;
      const groupWords = readGroupOfThree(g, isHighest);
      words += groupWords + " " + scales[i] + " ";
    }
  }

  words = words.trim().replace(/\s+/g, " ");
  if (!words) return "Không đồng chẵn";

  // Capitalize first letter and append "đồng chẵn"
  const formatted = words.charAt(0).toUpperCase() + words.slice(1) + " đồng chẵn";
  return amount < 0 ? `Âm ${formatted.toLowerCase()}` : formatted;
}

