"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Loading } from "../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback, useMemo } from "react";
import { ImageUploader } from "../global/image-uploader";
import { ImagesPreview } from "../global/images-preview";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import { useUpdateSubcategory } from "@/app/(admin)/admin/categories/hooks/custom-hook-subcategory";
import {
  Subcategory,
  useCategoriesStore,
} from "@/stores/admin/categories-store";
import {
  UpdateSubcategorySchema,
  UpdateSubcategoryType,
} from "@/queries/admin/subcategories/types";
import {
  useRemoveImages,
  useUploadImages,
} from "@/app/(admin)/admin/categories/hooks/custom-hook-category";

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

interface UpdateSubcategoryFormProps {
  data: Subcategory;
}

export const UpdateSubcategoryForm = ({ data }: UpdateSubcategoryFormProps) => {
  // States and hooks
  const { close } = useModal();
  const categories = useCategoriesStore((state) => state.categories);
  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);

  // API hooks
  const { uploadImagesAsync, isLoading: isUploadingImages } = useUploadImages();
  const { updateSubcategoryAsync, isLoading: isUpdatingSubcategory } =
    useUpdateSubcategory();
  const { removeImagesAsync, isLoading: isRemovingImages } = useRemoveImages();

  // Form setup
  const form = useForm<UpdateSubcategoryType>({
    resolver: zodResolver(UpdateSubcategorySchema),
    mode: "onChange",
    defaultValues: {
      id: data.id,
      name: data.name || "",
      category_id: data.category_id?.toString() || "",
      public_id: data.public_id || null,
      image_url: data.image_url || null,
    },
  });

  // Computed values
  const isSubmitting = useMemo(
    () =>
      form.formState.isSubmitting ||
      isUploadingImages ||
      isRemovingImages ||
      isUpdatingSubcategory,
    [
      form.formState.isSubmitting,
      isUploadingImages,
      isRemovingImages,
      isUpdatingSubcategory,
    ]
  );

  const hasExistingImage = useMemo(
    () => Boolean(form.getValues("image_url")),
    [form]
  );

  const availableCategories = useMemo(
    () => categories.filter((category) => !category.is_deleted),
    [categories]
  );

  // Event handlers
  const handleImageSelection = useCallback((images: LocalImagePreview[]) => {
    setSelectedImages(images);
  }, []);

  const handleRemoveImage = useCallback(async () => {
    const publicId = data.public_id;

    if (!publicId) {
      toast.error("No image to remove");
      return;
    }

    try {
      await removeImagesAsync({ publicIds: [publicId] });

      // Update form values
      form.setValue("image_url", null);
      form.setValue("public_id", null);
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.");
    }
  }, [data.public_id, removeImagesAsync, form]);

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
    setSelectedImages([]);
  }, [form, data]);

  const handleFormSubmit = useCallback(
    async (values: UpdateSubcategoryType) => {
      try {
        // Handle image upload if new image is selected
        if (selectedImages.length > 0) {
          const uploadResult = await uploadImagesAsync({
            images: [selectedImages[0].base64Url],
          });

          const uploadedImage = uploadResult.data[0];
          values.image_url = uploadedImage.imageUrl;
          values.public_id = uploadedImage.publicId;
        }

        await updateSubcategoryAsync(values);
        setSelectedImages([]);
        resetForm();
        close();
      } catch (error) {
        console.error("Error updating subcategory:", error);
        toast.error("Failed to update subcategory. Please try again.");
      }
    },
    [
      selectedImages,
      uploadImagesAsync,
      updateSubcategoryAsync,
      resetForm,
      close,
    ]
  );

  // Render helpers
  const renderCategoryOptions = useCallback(() => {
    if (availableCategories.length === 0) {
      return (
        <SelectItem value="" disabled>
          No categories available
        </SelectItem>
      );
    }

    return availableCategories.map((category) => (
      <SelectItem key={category.id} value={category.id.toString()}>
        {category.name}
      </SelectItem>
    ));
  }, [availableCategories]);

  const renderImageSection = useCallback(() => {
    if (hasExistingImage) {
      return (
        <ImagesPreview
          previewList={[
            {
              id: data.id,
              url: form.getValues("image_url") as string,
            },
          ]}
          disabled={isSubmitting}
          onRemove={handleRemoveImage}
        />
      );
    }

    return (
      <FormControl>
        <ImageUploader
          multiple={false}
          disabled={isSubmitting}
          onImagesChange={handleImageSelection}
        />
      </FormControl>
    );
  }, [
    hasExistingImage,
    data.id,
    form,
    isSubmitting,
    handleRemoveImage,
    handleImageSelection,
  ]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Subcategory Name Field */}
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
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parent Category Field */}
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
                    disabled={isSubmitting}
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

          {/* Image Upload Field */}
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

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="min-w-[140px]"
            >
              {isSubmitting ? <Loading /> : "Update Subcategory"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
