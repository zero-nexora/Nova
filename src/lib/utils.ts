import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { FormatUSDOptions } from "./types";
import { ProductFilters } from "@/app/(client)/hooks/products/use-product-fillter";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateUniqueId = (): string => crypto.randomUUID();

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(fileReader.result as string);
    fileReader.onerror = reject;
    fileReader.readAsDataURL(file);
  });
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export function formatUSD(
  value: number | string,
  opts: FormatUSDOptions = {}
): string {
  const {
    locale = "en-US",
    accounting = false,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = opts;

  const num =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value);

  if (!isFinite(num)) return String(value);

  const absNum = Math.abs(num);

  const nf = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const formatted = nf.format(absNum);

  if (num < 0) {
    return accounting ? `(${formatted})` : `-${formatted}`;
  }

  return formatted;
}

export function normalizeFilters(params: ProductFilters): ProductFilters {
  return {
    ...params,
    search: params.search?.trim() === "" ? undefined : params.search,
    slugCategory:
      params.slugCategory?.trim() === "" ? undefined : params.slugCategory,
    slugSubcategory:
      params.slugSubcategory?.trim() === ""
        ? undefined
        : params.slugSubcategory,
    priceMin: params.priceMin === 0 ? undefined : params.priceMin,
    priceMax: params.priceMax === 0 ? undefined : params.priceMax,
  };
}
