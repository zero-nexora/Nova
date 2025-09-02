"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import {
  useCreateCategory,
  useUploadImages,
} from "@/app/(admin)/admin/categories/hooks/custom-hook";
import { toast } from "sonner";
import ImageUploader from "../global/image-uploader";
import {
  CreateCategorySchema,
  CreateCategoryType,
} from "@/queries/admin/categories/types";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import { useModal } from "@/stores/modal-store";

export const CreateCategoryForm = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const { createCategoryAsync } = useCreateCategory();
  const { uploadImagesAsync } = useUploadImages();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagesUploader, setImagesUploader] = useState<LocalImagePreview[]>([]);
  const { close } = useModal();

  const form = useForm<CreateCategoryType>({
    defaultValues: {
      name: "",
      images: {
        imageUrl: "",
        publicId: "",
      },
      parentId: null,
    },
    resolver: zodResolver(CreateCategorySchema),
    mode: "onChange",
  });

  const isProcessing = isSubmitting;

  const onSubmit = async (values: CreateCategoryType) => {
    try {
      setIsSubmitting(true);
      const uploadedImages = await uploadImagesAsync({
        images: [imagesUploader[0].base64Url],
      });

      values.images.imageUrl = uploadedImages.data[0].imageUrl;
      values.images.publicId = uploadedImages.data[0].publicId;

      await createCategoryAsync(values);
      close();
      form.reset();
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Create New Category</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Name Field */}
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
                    disabled={isProcessing}
                    className="h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image Upload Field */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <FormLabel>Category Image</FormLabel>
                <FormControl>
                  <ImageUploader
                    setImageUploader={(imagesUpload: LocalImagePreview[]) =>
                      setImagesUploader(imagesUpload)
                    }
                    disabled={isProcessing}
                    multiple={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Parent Category Field */}
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category (Optional)</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      // Convert "clear" -> null, else number
                      field.onChange(value === "clear" ? "" : value);
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>

                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                      <SelectItem
                        key="clear"
                        value="clear"
                        className="w-full px-2 py-1.5 flex items-center"
                      >
                        No parent category
                      </SelectItem>

                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                          className="w-full px-2 py-1.5 flex items-center"
                        >
                          {category.name}
                        </SelectItem>
                      ))}

                      {categories.length === 0 && (
                        <SelectItem
                          key="empty"
                          value="empty"
                          className="w-full px-2 py-1.5 flex items-center"
                          disabled
                        >
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isProcessing}
            className="min-w-[140px]"
          >
            {isProcessing
              ? "Uploading..."
              : isSubmitting
              ? "Creating..."
              : "Create Category"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateCategoryForm;
