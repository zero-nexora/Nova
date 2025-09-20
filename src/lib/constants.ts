import { Home, Box, Tag, ShoppingCart, Settings } from "lucide-react";

const PREFIX = "/admin";
export const MAX_FILES = 10;
export const MAX_FILE_CATEGORY = 1;
export const DEFAULT_LIMIT = 10;
export const DEFAULT_PAGE = 1;

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
    image_url: "",
    public_id: "",
    subcategories: [
      {
        name: "Smartphones",
        slug: "smartphones",
        image_url: "",
        public_id: "",
      },
      {
        name: "Laptops",
        slug: "laptops",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Clothing",
    slug: "clothing",
    image_url: "",
    public_id: "clothing-img",
    subcategories: [
      {
        name: "Men",
        slug: "men-clothing",
        image_url: "",
        public_id: "",
      },
      {
        name: "Women",
        slug: "women-clothing",
        image_url: "",
        public_id: "",
      },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    image_url: "",
    public_id: "",
    subcategories: [
      {
        name: "Tables",
        slug: "tables",
        image_url: "",
        public_id: "",
      },
      {
        name: "Chairs",
        slug: "chairs",
        image_url: "",
        public_id: "",
      },
    ],
  },
];

export const attributesData = [
  {
    name: "Color",
    values: [{ value: "Red" }, { value: "Blue" }, { value: "Green" }],
  },
  {
    name: "Size",
    values: [{ value: "Small" }, { value: "Medium" }, { value: "Large" }],
  },
  {
    name: "Material",
    values: [{ value: "Cotton" }, { value: "Wool" }, { value: "Silk" }],
  },
];
