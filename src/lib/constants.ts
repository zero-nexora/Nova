import { Home, Box, Tag, ShoppingCart, Settings } from "lucide-react";

const PREFIX = "/admin";
export const MAX_FILES = 10;
export const MAX_FILE_CATEGORY = 1;

export const sidebarRoutes = [
  {
    label: "Dashboard",
    path: `${PREFIX}/dashboard`,
    icon: Home,
  },
  {
    label: "Product",
    path: `${PREFIX}/products`,
    icon: Box,
  },
  {
    label: "Category",
    path: `${PREFIX}/categories`,
    icon: Tag,
  },
  {
    label: "Order",
    path: `${PREFIX}/orders`,
    icon: ShoppingCart,
  },
  {
    label: "Setting",
    path: `${PREFIX}/settings`,
    icon: Settings,
  },
];

export const categoriesData = [
  {
    name: "Electronics",
    slug: "electronics",
    image_url: null,
    public_id: null,
    subcategories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Laptops", slug: "laptops" },
    ],
  },
  {
    name: "Clothing",
    slug: "clothing",
    image_url: null,
    public_id: null,
    subcategories: [
      { name: "Men", slug: "men-clothing" },
      { name: "Women", slug: "women-clothing" },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    image_url: null,
    public_id: null,
    subcategories: [
      { name: "Tables", slug: "tables" },
      { name: "Chairs", slug: "chairs" },
    ],
  },
];
