import { Home, Box, Tag, ShoppingCart, Settings } from "lucide-react";
import { CategorySeedType } from "./types";

const PREFIX = "/admin";

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

export const categoriesData: CategorySeedType[] = [
  {
    name: "Electronics",
    slug: "electronics",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    public_id: null,
    children: [
      {
        name: "Smartphones",
        slug: "smartphones",
        image_url:
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
        public_id: null,
        children: [
          {
            name: "Android Phones",
            slug: "android-phones",
            image_url:
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
            public_id: null,
          },
          {
            name: "iPhones",
            slug: "iphones",
            image_url:
              "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
            public_id: null,
          },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        image_url:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        public_id: null,
        children: [
          {
            name: "Gaming Laptops",
            slug: "gaming-laptops",
            image_url:
              "https://images.unsplash.com/photo-1502877338535-766e1452684a",
            public_id: null,
          },
          {
            name: "Ultrabooks",
            slug: "ultrabooks",
            image_url:
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
            public_id: null,
          },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    image_url: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
    public_id: null,
    children: [
      {
        name: "Men",
        slug: "men-fashion",
        image_url:
          "https://images.unsplash.com/photo-1514996937319-344454492b37",
        public_id: null,
        children: [
          {
            name: "Shoes",
            slug: "men-shoes",
            image_url:
              "https://images.unsplash.com/photo-1528701800489-20be9c1a39b7",
            public_id: null,
          },
          {
            name: "Jackets",
            slug: "men-jackets",
            image_url:
              "https://images.unsplash.com/photo-1534126511673-b6899657816a",
            public_id: null,
          },
        ],
      },
      {
        name: "Women",
        slug: "women-fashion",
        image_url:
          "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
        public_id: null,
        children: [
          {
            name: "Dresses",
            slug: "women-dresses",
            image_url:
              "https://images.unsplash.com/photo-1520975918319-56cda01a07a3",
            public_id: null,
          },
          {
            name: "Handbags",
            slug: "women-handbags",
            image_url:
              "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
            public_id: null,
          },
        ],
      },
    ],
  },
];
