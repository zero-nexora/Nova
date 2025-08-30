import { Home, Box, Tag, ShoppingCart, Settings } from "lucide-react";

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

