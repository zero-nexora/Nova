import { Home, Box, Tag, ShoppingCart, Settings } from "lucide-react";
import { CategorySeed } from "./types";

const PREFIX = "/admin";

export const sidebarRoutes = [
  {
    label: "Dashboard",
    path: `${PREFIX}/`,
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

export const categoriesData: CategorySeed[] = [
  {
    name: "Electronics",
    slug: "electronics",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"],
    children: [
      {
        name: "Smartphones",
        slug: "smartphones",
        images: [
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
        ],
        children: [
          {
            name: "Android Phones",
            slug: "android-phones",
            images: [
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
            ],
          },
          {
            name: "iPhones",
            slug: "iphones",
            images: [
              "https://images.unsplash.com/photo-1509395176047-4a66953fd231",
            ],
          },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        ],
        children: [
          {
            name: "Gaming Laptops",
            slug: "gaming-laptops",
            images: [
              "https://images.unsplash.com/photo-1502877338535-766e1452684a",
            ],
          },
          {
            name: "Ultrabooks",
            slug: "ultrabooks",
            images: [
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    images: ["https://images.unsplash.com/photo-1521335629791-ce4aec67dd47"],
    children: [
      {
        name: "Men",
        slug: "men-fashion",
        images: [
          "https://images.unsplash.com/photo-1514996937319-344454492b37",
        ],
        children: [
          {
            name: "Shoes",
            slug: "men-shoes",
            images: [
              "https://images.unsplash.com/photo-1528701800489-20be9c1a39b7",
            ],
          },
          {
            name: "Jackets",
            slug: "men-jackets",
            images: [
              "https://images.unsplash.com/photo-1534126511673-b6899657816a",
            ],
          },
        ],
      },
      {
        name: "Women",
        slug: "women-fashion",
        images: [
          "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
        ],
        children: [
          {
            name: "Dresses",
            slug: "women-dresses",
            images: [
              "https://images.unsplash.com/photo-1520975918319-56cda01a07a3",
            ],
          },
          {
            name: "Handbags",
            slug: "women-handbags",
            images: [
              "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
            ],
          },
        ],
      },
    ],
  },
];
