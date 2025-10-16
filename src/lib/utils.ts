import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { FormatUSDOptions } from "./types";
import { ProductFilters } from "@/app/(client)/hooks/products/use-product-fillters";
import { ProductFilters as ProductQueryParams } from "@/app/(admin)/admin/products/hooks/products/use-product-fillters";
import { RoleName } from "@prisma/client";
import { User } from "@/queries/client/users/types";
import { PREFIX, SidebarRoute, sidebarRoutes } from "./constants";
import { UserRoleFilters } from "@/app/(admin)/admin/roles/hooks/use-user-filters";
import { toast } from "sonner";
import { ProductResponse } from "@/queries/admin/products/types";

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

// Filters Client
export function normalizeFilters(params: ProductFilters): ProductFilters {
  return {
    ...params,
    search: params.search?.trim() === "" ? undefined : params.search,
    slugCategories:
      params.slugCategories?.length === 0 ? undefined : params.slugCategories,
    slugSubcategories:
      params.slugSubcategories?.length === 0
        ? undefined
        : params.slugSubcategories,
    excludeSlugs:
      params.excludeSlugs?.length === 0 ? undefined : params.excludeSlugs,
    priceMin: params.priceMin === 0 ? undefined : params.priceMin,
    priceMax: params.priceMax === 0 ? undefined : params.priceMax,
  };
}

// Filters Admin
export function cleanProductFilters(
  params: ProductQueryParams
): ProductQueryParams {
  return {
    ...params,
    search: params.search?.trim() === "" ? undefined : params.search,
    slugCategory:
      params.slugCategory?.trim() === "" ||
      params.slugCategory?.trim() === "all"
        ? undefined
        : params.slugCategory,
    slugSubcategory:
      params.slugSubcategory?.trim() === "" ||
      params.slugSubcategory?.trim() === "all"
        ? undefined
        : params.slugSubcategory,
    priceMin: params.priceMin === 0 ? undefined : params.priceMin,
    priceMax: params.priceMax === 0 ? undefined : params.priceMax,
  };
}

export function cleanUserRoleFilters(
  filters: UserRoleFilters
): UserRoleFilters {
  return {
    ...filters,
    roleId:
      (filters.roleId === "" || filters.roleId === "all")
        ? undefined
        : filters.roleId,
    search: filters.search === "" ? undefined : filters.search,
  };
}

export function hasAnyRole(user: User): boolean {
  return user.roles.some((role) =>
    Object.values(RoleName).includes(role.role.name)
  );
}

export function isAdmin(user: User): boolean {
  return user.roles.some((role) => role.role.name === RoleName.ADMIN) ?? false;
}

export function isAdminOrManageProduct(user: User): boolean {
  return (
    user.roles.some(
      (role) =>
        role.role.name === RoleName.ADMIN ||
        role.role.name === RoleName.MANAGE_PRODUCT
    ) ?? false
  );
}

export function isAdminOrManageCategory(user: User): boolean {
  return (
    user.roles.some(
      (r) =>
        r.role.name === RoleName.ADMIN ||
        r.role.name === RoleName.MANAGE_CATEGORY
    ) ?? false
  );
}

export function isAdminOrManageStaff(user: User): boolean {
  return (
    user.roles.some(
      (role) =>
        role.role.name === RoleName.ADMIN ||
        role.role.name === RoleName.MANAGE_STAFF
    ) ?? false
  );
}

export function isAdminOrManageOrder(user: User): boolean {
  return (
    user.roles.some(
      (role) =>
        role.role.name === RoleName.ADMIN ||
        role.role.name === RoleName.MANAGE_ORDER
    ) ?? false
  );
}

export function restrictSidebarRoutes(user: User | null): SidebarRoute[] {
  if (!user) return [];
  return sidebarRoutes.filter((route) => {
    switch (route.label) {
      case "Dashboard":
        return isAdmin(user);
      case "Product":
        return isAdminOrManageProduct(user);

      case "Category & Subcategory":
        return isAdminOrManageCategory(user);

      case "User & Role":
      case "Permission":
        return isAdminOrManageStaff(user);

      case "Order":
        return isAdminOrManageOrder(user);

      case "Setting":
        return hasAnyRole(user);
      default:
        return false;
    }
  });
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributeValueIds: string[];
  isExisting?: boolean;
}

export const generateSKU = (baseProductName: string, index: number): string => {
  const productPrefix = baseProductName
    .toUpperCase()
    .replace(/\s+/g, "-")
    .substring(0, 6);
  return `${productPrefix}-${String(index + 1).padStart(3, "0")}`;
};

export const createDefaultVariant = (isExisting = false): ProductVariant => ({
  id: isExisting ? `existing_${Date.now()}` : `new_${Date.now()}`,
  sku: "",
  price: 0,
  stock_quantity: 0,
  attributeValueIds: [],
  isExisting,
});

export const validateVariants = (variants: ProductVariant[]): boolean => {
  if (variants.length === 0) {
    toast.error("Please create at least one product variant");
    return false;
  }

  for (const variant of variants) {
    if (!variant.sku.trim()) {
      toast.error("All variants must have a SKU");
      return false;
    }
    if (variant.price <= 0) {
      toast.error("All variants must have a valid price");
      return false;
    }
    if (variant.stock_quantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return false;
    }
  }

  return true;
};

export const deduplicateVariants = (
  variants: ProductVariant[]
): ProductVariant[] => {
  const uniqueVariantsMap = new Map<string, ProductVariant>();

  variants.forEach((variant) => {
    const key = variant.attributeValueIds.sort().join(",");
    uniqueVariantsMap.set(key, variant);
  });

  const uniqueVariants = Array.from(uniqueVariantsMap.values());

  if (uniqueVariants.length < variants.length) {
    toast.info(
      `Merged ${variants.length - uniqueVariants.length} duplicate variant(s)`
    );
  }

  return uniqueVariants;
};

export const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
};

export const extractProductIds = (products: ProductResponse[]): string[] => {
  return products.map((product) => product.id).filter(Boolean);
};

export const extractAllImagePublicIds = (
  products: ProductResponse[]
): string[] => {
  const publicIds: string[] = [];

  products.forEach((product) => {
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((image) => {
        if (image.public_id) {
          publicIds.push(image.public_id);
        }
      });
    }
  });

  return publicIds;
};

export const extractProductImagePublicIds = (
  product: ProductResponse
): string[] => {
  if (!product.images || !Array.isArray(product.images)) {
    return [];
  }

  return product.images
    .map((image) => image.public_id)
    .filter((id): id is string => Boolean(id));
};


export function getAdminLink(user: User): string {
  if (!user?.roles?.length) return "/";

  const roleNames = user.roles.map((r: any) => r.role.name);

  if (roleNames.includes(RoleName.ADMIN)) return `${PREFIX}/dashboard`;
  if (roleNames.includes(RoleName.MANAGE_CATEGORY)) return `${PREFIX}/categories`;
  if (roleNames.includes(RoleName.MANAGE_PRODUCT)) return `${PREFIX}/products`;
  if (roleNames.includes(RoleName.MANAGE_STAFF)) return `${PREFIX}/roles`;
  if (roleNames.includes(RoleName.MANAGE_ORDER)) return `${PREFIX}/orders`;

  return "/";
}