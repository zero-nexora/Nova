import { CreateCategory } from "./create-category";
import { CategoryDataTable } from "./category-data-table";

export const CategoryTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-end">
        <CreateCategory />
      </div>
      <CategoryDataTable />
    </div>
  );
};
