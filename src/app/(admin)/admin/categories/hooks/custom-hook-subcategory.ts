"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { getCategoryQueryKeys } from "./custom-hook-category";

const getSubcategoryQueryKeys = (trpc: ReturnType<typeof useTRPC>) => ({
  all: () => trpc.admin.subcategoriesRouter.getAll.queryOptions(),
  byId: (id: string) =>
    trpc.admin.subcategoriesRouter.getById.queryOptions({ id }),
  bySlug: (slug: string) =>
    trpc.admin.subcategoriesRouter.getBySlug.queryOptions({ slug }),
});

export function useGetAllSubcategories() {
  const trpc = useTRPC();

  const { data, isFetching } = useQuery(
    trpc.admin.subcategoriesRouter.getAll.queryOptions()
  );

  return {
    activeSubcategories: data?.activeSubcategories || [],
    deletedSubcategories: data?.deletedSubcategories || [],
    isFetching,
  };
}

export function useGetSubcategoryById(id: string, enabled = true) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.admin.subcategoriesRouter.getById.queryOptions({ id }),
    enabled: enabled && !!id,
  });

  return {
    subcategory: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGetSubcategoryBySlug(slug: string, enabled = true) {
  const trpc = useTRPC();

  const query = useQuery({
    ...trpc.admin.subcategoriesRouter.getBySlug.queryOptions({ slug }),
    enabled: enabled && !!slug,
  });

  return {
    subcategory: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.subcategoriesRouter.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Subcategory created successfully");
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      // Also invalidate categories to update subcategory count
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getAll" ||
          query.queryKey[0] === "categoriesAdmin.getById",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create subcategory");
    },
  });

  return {
    createSubcategory: mutation.mutate,
    createSubcategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.subcategoriesRouter.update.mutationOptions(),
    onSuccess: (data) => {
      toast.success("Subcategory updated successfully");

      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries(
        getSubcategoryQueryKeys(trpc).byId(data.id)
      );

      if (data.slug) {
        queryClient.invalidateQueries(
          getSubcategoryQueryKeys(trpc).bySlug(data.slug)
        );
      }

      // Also invalidate categories to update subcategory data
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getAll" ||
          query.queryKey[0] === "categoriesAdmin.getById",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update subcategory");
    },
  });

  return {
    updateSubcategory: mutation.mutate,
    updateSubcategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteSubcategory() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.subcategoriesRouter.delete.mutationOptions(),
    onSuccess: () => {
      toast.dismiss();
      toast.success("Subcategory permanently deleted");

      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "subcategoriesAdmin.getById" ||
          query.queryKey[0] === "subcategoriesAdmin.getBySlug",
      });

      // Also invalidate categories to update subcategory count
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getAll" ||
          query.queryKey[0] === "categoriesAdmin.getById",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete subcategory");
    },
  });

  return {
    deleteSubcategory: mutation.mutate,
    deleteSubcategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteSubcategories() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.subcategoriesRouter.deletes.mutationOptions(),
    onSuccess: (data) => {
      toast.dismiss();
      const { deletedCount, message } = data;
      toast.success(
        message || `${deletedCount} subcategories permanently deleted`
      );
      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());

      // Also invalidate categories to update subcategory count
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getAll" ||
          query.queryKey[0] === "categoriesAdmin.getById",
      });
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Failed to permanently delete subcategories"
      );
    },
  });

  return {
    deleteSubcategories: mutation.mutate,
    deleteSubcategoriesAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useToggleSubcategoryDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.subcategoriesRouter.toggleDeleted.mutationOptions(),
    onSuccess: (data) => {
      toast.dismiss();
      const message = data.is_deleted
        ? `Subcategory "${data.name}" moved to trash successfully`
        : `Subcategory "${data.name}" restored successfully`;
      toast.success(message);

      queryClient.invalidateQueries(getCategoryQueryKeys(trpc).all());
      queryClient.invalidateQueries(
        getSubcategoryQueryKeys(trpc).byId(data.id)
      );

      if (data.slug) {
        queryClient.invalidateQueries(
          getSubcategoryQueryKeys(trpc).bySlug(data.slug)
        );
      }

      // Also invalidate categories to update subcategory data
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getAll" ||
          query.queryKey[0] === "categoriesAdmin.getById",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle subcategory");
    },
  });

  return {
    toggleSubcategory: mutation.mutate,
    toggleSubcategoryAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useToggleSubcategoriesDeleted() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...trpc.admin.subcategoriesRouter.togglesDeleted.mutationOptions(),
    onSuccess: (data) => {
      toast.dismiss();

      const deletedCount = data.filter((subcat) => subcat?.is_deleted).length;
      const restoredCount = data.filter((subcat) => !subcat?.is_deleted).length;

      let message = "";
      if (deletedCount > 0 && restoredCount > 0) {
        message = `${deletedCount} subcategories moved to trash, ${restoredCount} subcategories restored`;
      } else if (deletedCount > 0) {
        message =
          deletedCount === 1
            ? `Subcategory "${data[0]?.name}" moved to trash successfully`
            : `${deletedCount} subcategories moved to trash successfully`;
      } else if (restoredCount > 0) {
        message =
          restoredCount === 1
            ? `Subcategory "${data[0]?.name}" restored successfully`
            : `${restoredCount} subcategories restored successfully`;
      }

      toast.success(message);

      queryClient.invalidateQueries(getSubcategoryQueryKeys(trpc).all());

      // Also invalidate categories to update subcategory data
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "categoriesAdmin.getAll" ||
          query.queryKey[0] === "categoriesAdmin.getById",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle subcategories");
    },
  });

  return {
    togglesSubcategoriesDeleted: mutation.mutate,
    togglesSubcategoriesDeletedAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
