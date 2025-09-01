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
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    public_id: null,
    children: [
      {
        name: "Smartphones",
        slug: "smartphones",
        image_url:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        public_id: null,
      },
      {
        name: "Laptops",
        slug: "laptops",
        image_url:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        public_id: null,
      },
      {
        name: "Cameras",
        slug: "cameras",
        image_url:
          "https://images.unsplash.com/photo-1519183071298-a2962eadcdb2",
        public_id: null,
      },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    public_id: null,
    children: [
      {
        name: "Men",
        slug: "men-fashion",
        image_url:
          "https://images.unsplash.com/photo-1528701800489-20be9c1c54f0",
        public_id: null,
      },
      {
        name: "Women",
        slug: "women-fashion",
        image_url:
          "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47",
        public_id: null,
      },
      {
        name: "Kids",
        slug: "kids-fashion",
        image_url:
          "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
        public_id: null,
      },
    ],
  },
  {
    name: "Home & Furniture",
    slug: "home-furniture",
    image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    public_id: null,
    children: [
      {
        name: "Living Room",
        slug: "living-room",
        image_url:
          "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
        public_id: null,
      },
      {
        name: "Bedroom",
        slug: "bedroom",
        image_url:
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
        public_id: null,
      },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    image_url: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
    public_id: null,
    children: [
      {
        name: "Fitness",
        slug: "fitness",
        image_url:
          "https://images.unsplash.com/photo-1571019613914-85f342c0f07e",
        public_id: null,
      },
      {
        name: "Camping",
        slug: "camping",
        image_url:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        public_id: null,
      },
    ],
  },
];
