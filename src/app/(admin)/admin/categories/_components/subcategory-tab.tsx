import { CreateSubcategory } from "./create-subcategory";
import { SubcategoryDataTable } from "./subcategory-data-table";

export const SubcategoryTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-end">
        <CreateSubcategory />
      </div>
      <SubcategoryDataTable />
    </div>
  );
};
