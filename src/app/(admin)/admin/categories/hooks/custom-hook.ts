// // hooks/use-categories.ts
// import { api } from "@/trpc/react";
// import { useToast } from "@/hooks/use-toast";
// import { useRouter } from "next/navigation";
// import { useMemo } from "react";

// // Types based on your schema and procedures
// export interface GetAllCategoriesInput {
//   page?: number;
//   limit?: number;
//   search?: string;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
// }

// export interface CreateCategoryInput {
//   name: string;
//   parent_id?: string;
//   image_url?: string;
//   public_id?: string;
// }

// export interface UpdateCategoryInput {
//   id: string;
//   name?: string;
//   parent_id?: string;
//   image_url?: string;
//   public_id?: string;
// }

// export interface DeleteCategoryInput {
//   id: string;
//   hard_delete?: boolean;
// }

// // Hook for getting all categories with pagination
// export function useGetAllCategories(input: GetAllCategoriesInput = {}) {
//   const query = api.categories.getAll.useQuery(input);

//   return {
//     categories: query.data?.data ?? [],
//     pagination: query.data?.pagination,
//     isLoading: query.isLoading,
//     isError: query.isError,
//     error: query.error,
//     refetch: query.refetch,
//     isFetching: query.isFetching,
//   };
// }

// // Hook for getting category by ID
// export function useGetCategoryById(id: string, enabled: boolean = true) {
//   const query = api.categories.getById.useQuery(
//     { id },
//     { enabled: enabled && !!id }
//   );

//   return {
//     category: query.data,
//     isLoading: query.isLoading,
//     isError: query.isError,
//     error: query.error,
//     refetch: query.refetch,
//   };
// }

// // Hook for getting category by slug
// export function useGetCategoryBySlug(slug: string, enabled: boolean = true) {
//   const query = api.categories.getBySlug.useQuery(
//     { slug },
//     { enabled: enabled && !!slug }
//   );

//   return {
//     category: query.data,
//     isLoading: query.isLoading,
//     isError: query.isError,
//     error: query.error,
//     refetch: query.refetch,
//   };
// }

// // Hook for creating category
// export function useCreateCategory() {
//   const { toast } = useToast();
//   const router = useRouter();
//   const utils = api.useUtils();

//   const mutation = api.categories.create.useMutation({
//     onSuccess: (data) => {
//       toast({
//         title: "Success",
//         description: "Category created successfully",
//       });
//       // Invalidate categories list
//       utils.categories.getAll.invalidate();
//       utils.categories.getById.invalidate();
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create category",
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     createCategory: mutation.mutate,
//     createCategoryAsync: mutation.mutateAsync,
//     isLoading: mutation.isLoading,
//     isError: mutation.isError,
//     error: mutation.error,
//     isSuccess: mutation.isSuccess,
//     reset: mutation.reset,
//   };
// }

// // Hook for updating category
// export function useUpdateCategory() {
//   const { toast } = useToast();
//   const utils = api.useUtils();

//   const mutation = api.categories.update.useMutation({
//     onSuccess: (data) => {
//       toast({
//         title: "Success",
//         description: "Category updated successfully",
//       });
//       // Invalidate related queries
//       utils.categories.getAll.invalidate();
//       utils.categories.getById.invalidate({ id: data.id });
//       utils.categories.getBySlug.invalidate({ slug: data.slug });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update category",
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     updateCategory: mutation.mutate,
//     updateCategoryAsync: mutation.mutateAsync,
//     isLoading: mutation.isLoading,
//     isError: mutation.isError,
//     error: mutation.error,
//     isSuccess: mutation.isSuccess,
//     reset: mutation.reset,
//   };
// }

// // Hook for deleting category
// export function useDeleteCategory() {
//   const { toast } = useToast();
//   const utils = api.useUtils();

//   const mutation = api.categories.delete.useMutation({
//     onSuccess: (data, variables) => {
//       toast({
//         title: "Success",
//         description: variables.hard_delete 
//           ? "Category permanently deleted" 
//           : "Category moved to trash",
//       });
//       // Invalidate categories list
//       utils.categories.getAll.invalidate();
//       utils.categories.getById.invalidate();
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to delete category",
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     deleteCategory: mutation.mutate,
//     deleteCategoryAsync: mutation.mutateAsync,
//     isLoading: mutation.isLoading,
//     isError: mutation.isError,
//     error: mutation.error,
//     isSuccess: mutation.isSuccess,
//     reset: mutation.reset,
//   };
// }

// // Hook for restoring category
// export function useRestoreCategory() {
//   const { toast } = useToast();
//   const utils = api.useUtils();

//   const mutation = api.categories.restore.useMutation({
//     onSuccess: (data) => {
//       toast({
//         title: "Success",
//         description: "Category restored successfully",
//       });
//       // Invalidate categories list
//       utils.categories.getAll.invalidate();
//       utils.categories.getById.invalidate({ id: data.id });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to restore category",
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     restoreCategory: mutation.mutate,
//     restoreCategoryAsync: mutation.mutateAsync,
//     isLoading: mutation.isLoading,
//     isError: mutation.isError,
//     error: mutation.error,
//     isSuccess: mutation.isSuccess,
//     reset: mutation.reset,
//   };
// }

// // Composite hook for category management
// export function useCategoryManagement() {
//   const createMutation = useCreateCategory();
//   const updateMutation = useUpdateCategory();
//   const deleteMutation = useDeleteCategory();
//   const restoreMutation = useRestoreCategory();

//   const isAnyLoading = useMemo(() => {
//     return (
//       createMutation.isLoading ||
//       updateMutation.isLoading ||
//       deleteMutation.isLoading ||
//       restoreMutation.isLoading
//     );
//   }, [
//     createMutation.isLoading,
//     updateMutation.isLoading,
//     deleteMutation.isLoading,
//     restoreMutation.isLoading,
//   ]);

//   return {
//     // Create
//     createCategory: createMutation.createCategory,
//     createCategoryAsync: createMutation.createCategoryAsync,
//     isCreating: createMutation.isLoading,
    
//     // Update
//     updateCategory: updateMutation.updateCategory,
//     updateCategoryAsync: updateMutation.updateCategoryAsync,
//     isUpdating: updateMutation.isLoading,
    
//     // Delete
//     deleteCategory: deleteMutation.deleteCategory,
//     deleteCategoryAsync: deleteMutation.deleteCategoryAsync,
//     isDeleting: deleteMutation.isLoading,
    
//     // Restore
//     restoreCategory: restoreMutation.restoreCategory,
//     restoreCategoryAsync: restoreMutation.restoreCategoryAsync,
//     isRestoring: restoreMutation.isLoading,
    
//     // General state
//     isAnyLoading,
    
//     // Reset functions
//     resetAll: () => {
//       createMutation.reset();
//       updateMutation.reset();
//       deleteMutation.reset();
//       restoreMutation.reset();
//     },
//   };
// }

// // Hook for category options (useful for dropdowns)
// export function useCategoryOptions() {
//   const { categories, isLoading } = useGetAllCategories({
//     limit: 100, // Get more for options
//     sortBy: "name",
//     sortOrder: "asc",
//   });

//   const options = useMemo(() => {
//     return categories.map((category) => ({
//       value: category.id,
//       label: category.parentName 
//         ? `${category.parentName} > ${category.name}` 
//         : category.name,
//       parentId: category.parentId,
//       isChild: !!category.parentId,
//     }));
//   }, [categories]);

//   const parentOptions = useMemo(() => {
//     return categories
//       .filter((cat) => !cat.parentId) // Only root categories
//       .map((category) => ({
//         value: category.id,
//         label: category.name,
//       }));
//   }, [categories]);

//   return {
//     options,
//     parentOptions,
//     isLoading,
//   };
// }

// // Hook for category statistics
// export function useCategoryStats(categoryId?: string) {
//   const { categories } = useGetAllCategories();
  
//   const stats = useMemo(() => {
//     if (categoryId) {
//       const category = categories.find(cat => cat.id === categoryId);
//       return {
//         totalProducts: category?.productsCount || 0,
//         totalChildren: category?.childrenCount || 0,
//       };
//     }

//     return {
//       totalCategories: categories.length,
//       totalParentCategories: categories.filter(cat => !cat.parentId).length,
//       totalChildCategories: categories.filter(cat => cat.parentId).length,
//       totalProducts: categories.reduce((sum, cat) => sum + (cat.productsCount || 0), 0),
//     };
//   }, [categories, categoryId]);

//   return stats;
// }