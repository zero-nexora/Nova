"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Loading } from "../../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { ImageUploader } from "../../uploader/image-uploader";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
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
import { useCreateSubcategory } from "@/app/(admin)/admin/categories/hooks/subcategories/use-create-subcategory";
import { useUploadImage } from "@/components/uploader/hooks/use-uploader";
import { useGetAllCategories } from "@/app/(admin)/admin/categories/hooks/categories/use-get-all-categories";

export const CreateSubcategoryForm = () => {
  const { close } = useModal();

  const { categories } = useGetAllCategories();

  const { createSubcategoryAsync } = useCreateSubcategory();
  const { uploadImageAsync, isPending: isUploadingImage } = useUploadImage();

  const [selectedImage, setSelectedImage] = useState<LocalImagePreview | null>(
    null
  );

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

  const isLoading = useMemo(
    () => form.formState.isLoading || isUploadingImage,
    [form.formState.isLoading, isUploadingImage]
  );

  const availableCategories = useMemo(
    () => categories.filter((category) => !category.is_deleted),
    [categories]
  );

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImage(images[0]);
  };

  const renderCategoryOptions = useCallback(() => {
    if (availableCategories.length === 0) {
      return (
        <div className="text-center p-2 rounded-md">
          No categories available
        </div>
      );
    }

    return availableCategories
      .filter((category) => !category.is_deleted)
      .map((category) => (
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
    setSelectedImage(null);
  }, [form]);

  const handleFormSubmit = async (values: CreateSubcategoryType) => {
    if (!selectedImage) {
      toast.error("Please select an image for the subcategory");
      return;
    }

    try {
      const uploadResult = await uploadImageAsync({
        image: selectedImage.base64Url,
      });

      const uploadedImage = uploadResult.data;

      values.image_url = uploadedImage.imageUrl;
      values.public_id = uploadedImage.publicId;

      await createSubcategoryAsync(values);

      resetForm();
      close();
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
                  disabled={isLoading}
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
              <FormLabel>Subcategory Image *</FormLabel>
              <FormControl>
                <ImageUploader
                  multiple={false}
                  disabled={isLoading}
                  onImagesChange={handleImageSelection}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[140px] ml-auto"
        >
          {isLoading ? <Loading /> : "Create Subcategory"}
        </Button>
      </form>
    </Form>
  );
};
