"use client";

import { StoreClientProvider } from "@/providers/store-client-provider";

interface LayoutClientProps {
  children: React.ReactNode;
}

const LayoutClient = ({ children }: LayoutClientProps) => {
  return <StoreClientProvider>{children}</StoreClientProvider>;
};

export default LayoutClient;
