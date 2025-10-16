import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryTab } from "./category-tab";
import { SubcategoryTab } from "./subcategory-tab";
import { Skeleton } from "@/components/ui/skeleton";

export const CategoryView = () => {
  return (
    <Tabs defaultValue="category">
      <TabsList className="flex gap-4">
        <TabsTrigger value="category">Category</TabsTrigger>
        <TabsTrigger value="subcategory">Subcategory</TabsTrigger>
      </TabsList>
      <TabsContent value="category">
        <CategoryTab />
      </TabsContent>
      <TabsContent value="subcategory">
        <SubcategoryTab />
      </TabsContent>
    </Tabs>
  );
};

export const CategoryViewSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex items-center gap-4 py-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-10 w-44" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <Skeleton className="h-96 w-full" />

      <Skeleton className="h-4 w-48" />
    </div>
  );
};
