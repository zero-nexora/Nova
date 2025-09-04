"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { useCategoriesStore } from "@/stores/admin/categories-store";
import { useModal } from "@/stores/modal-store";
import {
  useCreateCategory,
  useUploadImages,
} from "@/app/(admin)/admin/categories/hooks/custom-hook";
import {
  CreateCategorySchema,
  CreateCategoryType,
} from "@/queries/admin/categories/types";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import ImageUploader from "../global/image-uploader";
import { Loading } from "../global/loading";

export const CreateCategoryForm = () => {
  // Store & Modal
  const categories = useCategoriesStore((state) => state.categories);
  const { close } = useModal();

  // Hooks
  const { createCategoryAsync } = useCreateCategory();
  const { uploadImagesAsync } = useUploadImages();

  // Local State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);

  // Form Setup
  const form = useForm<CreateCategoryType>({
    resolver: zodResolver(CreateCategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      image_url: null,
      public_id: null,
      parentId: null,
    },
  });

  // Handlers
  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImages(images);
  };

  const handleParentCategoryChange = (value: string) => {
    const parentId = value === "clear" || value === "" ? null : value;
    form.setValue("parentId", parentId);
  };

  const handleFormSubmit = async (values: CreateCategoryType) => {
    if (selectedImages.length === 0) {
      toast.error("Please select an image for the category");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image first
      const uploadResult = await uploadImagesAsync({
        images: [selectedImages[0].base64Url],
      });

      // Update form values with uploaded image data
      const uploadedImage = uploadResult.data[0];

      values.image_url = uploadedImage.imageUrl;
      values.public_id = uploadedImage.publicId;

      await createCategoryAsync(values);
      // Success cleanup
      form.reset();
      setSelectedImages([]);
      close();
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render parent category options
  const renderParentCategoryOptions = () => {
    if (categories.length === 0) {
      return (
        <SelectItem value="empty" disabled>
          No categories available
        </SelectItem>
      );
    }

    return (
      <>
        <SelectItem value="clear">No parent category</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </SelectItem>
        ))}
      </>
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-y-6"
      >
        {/* Category Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image_url"
          render={() => (
            <FormItem>
              <FormLabel>Category Image *</FormLabel>
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

        {/* Parent Category */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category (Optional)</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={handleParentCategoryChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>

                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    {renderParentCategoryOptions()}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[140px] ml-auto"
        >
          {isSubmitting ? <Loading /> : "Create Category"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateCategoryForm;
