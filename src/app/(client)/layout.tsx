"use client";

import { StoreClientProvider } from "@/providers/store-client-provider";
import { CategorySection } from "./_components/category-section";
import { Header } from "./_components/header";

interface LayoutHomeProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutHomeProps) {
  return (
    <StoreClientProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <CategorySection />
        <main className="flex-1 container mx-auto pt-8">{children}</main>
      </div>
    </StoreClientProvider>
  );
}
