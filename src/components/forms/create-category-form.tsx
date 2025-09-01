"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { ImageUploader } from "../global/image-uploader";
import { createCategorySchema } from "@/queries/admin/categories/types";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { useCreateCategory } from "@/app/(admin)/admin/categories/hooks/custom-hook";

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export const CreateCategoryForm = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const {createCategoryAsync} = useCreateCategory();

  const form = useForm<CreateCategoryFormData>({
    defaultValues: {
      image_url: "",
      name: "",
      parent_id: null,
      public_id: null,
    },
    resolver: zodResolver(createCategorySchema),
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleImageUpload = (
    uploadedImages: Array<{ url: string; publicId: string }>
  ) => {
    if (uploadedImages.length > 0) {
      const firstImage = uploadedImages[0];
      form.setValue("image_url", firstImage.url);
      form.setValue("public_id", firstImage.publicId);
    } else {
      form.setValue("image_url", "");
      form.setValue("public_id", null);
    }
  };

  const onSubmit = async (values: CreateCategoryFormData) => {
    try {
      createCategoryAsync(values);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Category Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter category name"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload Field */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <ImageUploader
                  maxFiles={1}
                  multiple={false}
                  folder="categories"
                  disabled={isSubmitting}
                  onChange={handleImageUpload}
                  value={
                    field.value
                      ? [
                          {
                            url: field.value,
                            publicId: form.getValues("public_id") || "",
                          },
                        ]
                      : []
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category Field */}
        <FormField
          control={form.control}
          name="parent_id"
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

                  {/* SelectContent bằng width trigger */}
                  <SelectContent className="w-[var(--radix-select-trigger-width)]">
                    {/* Option để clear selection */}
                    <SelectItem
                      key="clear"
                      value="clear"
                      className="w-full px-2 py-1.5 flex items-center"
                    >
                      No parent category
                    </SelectItem>

                    {/* Dynamic category options */}
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                        className="w-full px-2 py-1.5 flex items-center"
                      >
                        {category.name}
                      </SelectItem>
                    ))}

                    {/* Nếu không có category */}
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
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Creating..." : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
