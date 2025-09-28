"use client";

import { useSearchParams } from "next/navigation";
import { CategorySection } from "./category-section";
import { Header } from "./header";
import { ProductSection } from "./product-section";
import { useState } from "react";

export const HomeView = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    decodeURIComponent(searchParams.get("search") || "")
  );

  return (
    <div>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <CategorySection />
      <ProductSection search={searchQuery} />
    </div>
  );
};
