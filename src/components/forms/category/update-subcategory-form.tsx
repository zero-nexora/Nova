"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Loading } from "../../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo } from "react";
import { ImageUploader } from "../../uploader/image-uploader";
import { ImagesPreview } from "../../uploader/images-preview";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import {
  Subcategory,
  useCategoriesStore,
} from "@/stores/admin/categories-store";
import {
  UpdateSubcategorySchema,
  UpdateSubcategoryType,
} from "@/queries/admin/subcategories/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteImage,
  useUploadImage,
} from "@/components/uploader/hooks/use-uploader";
import { useUpdateSubcategory } from "@/app/(admin)/admin/categories/hooks/subcategories/use-update-subcategory";

interface UpdateSubcategoryFormProps {
  data: Subcategory;
}

export const UpdateSubcategoryForm = ({ data }: UpdateSubcategoryFormProps) => {
  // States and hooks
  const { close } = useModal();
  const categories = useCategoriesStore((state) => state.categories);
  const [selectedImage, setSelectedImage] = useState<LocalImagePreview | null>(
    null
  );

  const { uploadImageAsync, isPending: isUploadingImages } = useUploadImage();
  const { updateSubcategoryAsync } = useUpdateSubcategory();
  const { deleteImageAsync, isPending: isDeleteingImages } = useDeleteImage();

  const form = useForm<UpdateSubcategoryType>({
    resolver: zodResolver(UpdateSubcategorySchema),
    mode: "onChange",
    defaultValues: {
      id: data.id,
      name: data.name,
      category_id: data.category_id?.toString(),
      public_id: data.public_id || null,
      image_url: data.image_url || null,
    },
  });

  const isLoading = useMemo(
    () => form.formState.isLoading || isUploadingImages || isDeleteingImages,
    [(form.formState.isLoading, isUploadingImages, isDeleteingImages)]
  );

  const previewList = [{ id: data.id, url: data.image_url || "" }];

  const hasExistingImage = useMemo(
    () => Boolean(form.getValues("image_url")),
    [form]
  );

  const availableCategories = useMemo(
    () => categories.filter((category) => !category.is_deleted),
    [categories]
  );

  const handleImageSelection = useCallback((images: LocalImagePreview[]) => {
    setSelectedImage(images[0]);
  }, []);

  const handleDeleteImage = useCallback(async () => {
    try {
      if (!data.public_id) {
        toast.error("No image to remove");
        return;
      }

      await deleteImageAsync({ publicId: data.public_id });

      form.setValue("image_url", null);
      form.setValue("public_id", null);
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.");
    }
  }, [data.public_id, deleteImageAsync, form]);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      form.setValue("category_id", categoryId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
  );

  const resetForm = useCallback(() => {
    form.reset({
      id: data.id,
      name: data.name || "",
      category_id: data.category_id?.toString() || "",
      public_id: null,
      image_url: null,
    });
    setSelectedImage(null);
  }, [form, data]);

  const handleFormSubmit = useCallback(
    async (values: UpdateSubcategoryType) => {
      try {
        if (selectedImage) {
          const uploadResult = await uploadImageAsync({
            image: selectedImage.base64Url,
          });

          const uploadedImage = uploadResult.data;
          values.image_url = uploadedImage.imageUrl;
          values.public_id = uploadedImage.publicId;
        }

        await updateSubcategoryAsync(values);

        resetForm();
        close();
      } catch (error) {
        console.error("Error updating subcategory:", error);
        toast.error("Failed to update subcategory. Please try again.");
      }
    },
    [selectedImage, uploadImageAsync, updateSubcategoryAsync, resetForm, close]
  );

  const renderCategoryOptions = useCallback(() => {
    if (availableCategories.length === 0) {
      return <div className="text-center p-2 rounded-md">No categories available</div>;
    }

    return availableCategories.filter((category) => !category.is_deleted).map((category) => (
      <SelectItem key={category.id} value={category.id.toString()}>
        {category.name}
      </SelectItem>
    ));
  }, [availableCategories]);

  const renderImageSection = useCallback(() => {
    if (hasExistingImage) {
      return (
        <ImagesPreview
          previewList={previewList}
          disabled={isLoading}
          onRemove={handleDeleteImage}
        />
      );
    }

    return (
      <FormControl>
        <ImageUploader
          multiple={false}
          disabled={isLoading}
          onImagesChange={handleImageSelection}
        />
      </FormControl>
    );
  }, [
    hasExistingImage,
    data.id,
    form,
    isLoading,
    handleDeleteImage,
    handleImageSelection,
  ]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Subcategory Name *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter subcategory name"
                    disabled={isLoading}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Parent Category *
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleCategoryChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>{renderCategoryOptions()}</SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image_url"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Subcategory Image
                </FormLabel>
                {renderImageSection()}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className="min-w-[140px]"
            >
              {isLoading ? <Loading /> : "Update Subcategory"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
