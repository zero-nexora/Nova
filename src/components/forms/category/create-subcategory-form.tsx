"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Loading } from "../../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { ImageUploader } from "../../global/image-uploader";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import { useUploadImages } from "@/app/(admin)/admin/categories/hooks/custom-hook-category";
import { useCreateSubcategory } from "@/app/(admin)/admin/categories/hooks/custom-hook-subcategory";
import {
  CreateSubcategorySchema,
  CreateSubcategoryType,
} from "@/queries/admin/subcategories/types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const CreateSubcategoryForm = () => {
  const { close } = useModal();

  const categories = useCategoriesStore((state) => state.categories);

  const { createSubcategoryAsync } = useCreateSubcategory();
  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();

  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);

  const form = useForm<CreateSubcategoryType>({
    resolver: zodResolver(CreateSubcategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      image_url: null,
      public_id: null,
      category_id: "",
    },
  });

  const availableCategories = useMemo(
    () => categories.filter((category) => !category.is_deleted),
    [categories]
  );

  const isSubmitting = form.formState.isSubmitting || isLoadingUpload;

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImages(images);
  };

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
      name: "",
      category_id: "",
      public_id: null,
      image_url: null,
    });
    setSelectedImages([]);
  }, [form]);

  const handleFormSubmit = async (values: CreateSubcategoryType) => {
    if (selectedImages.length === 0) {
      toast.error("Please select an image for the subcategory");
      return;
    }

    try {
      const uploadResult = await uploadImagesAsync({
        images: [selectedImages[0].base64Url],
      });

      const uploadedImage = uploadResult.data[0];

      values.image_url = uploadedImage.imageUrl;
      values.public_id = uploadedImage.publicId;

      await createSubcategoryAsync(values);
      setSelectedImages([]);
      close();
      resetForm();
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error("Failed to create subcategory. Please try again.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter subcategory name"
                  disabled={isSubmitting}
                  className="h-12"
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

        <FormField
          control={form.control}
          name="image_url"
          render={() => (
            <FormItem>
              <FormLabel>Subcategory Image *</FormLabel>
              <FormControl>
                <ImageUploader
                  multiple={false}
                  disabled={isSubmitting}
                  onImagesChange={handleImageSelection}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[140px] ml-auto"
        >
          {isSubmitting ? <Loading /> : "Create Subcategory"}
        </Button>
      </form>
    </Form>
  );
};
