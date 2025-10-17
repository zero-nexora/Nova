import React, { Suspense } from "react";
import { PageHeader } from "@/components/global/page-header";
import { RoleGuardProvider } from "@/providers/role-guard-provider";
import {
  ProductAttributesView,
  ProductAttributesViewSkeleton,
} from "./_components/product-attributes-view";

const ProductAttributesPage = () => {
  return (
    <main>
      <RoleGuardProvider check="adminOrManageProduct">
        <PageHeader
          title="Product Attributes"
          description="Manage your product attributes."
        />
        <Suspense fallback={<ProductAttributesViewSkeleton />}>
          <ProductAttributesView />
        </Suspense>
      </RoleGuardProvider>
    </main>
  );
};

export default ProductAttributesPage;
