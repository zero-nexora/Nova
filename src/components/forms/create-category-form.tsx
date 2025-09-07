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
import { Button } from "@/components/ui/button";

import { useModal } from "@/stores/modal-store";
import {
  useCreateCategory,
  useUploadImages,
} from "@/app/(admin)/admin/categories/hooks/custom-hook-category";
import {
  CreateCategorySchema,
  CreateCategoryType,
} from "@/queries/admin/categories/types";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import ImageUploader from "../global/image-uploader";
import { Loading } from "../global/loading";

export const CreateCategoryForm = () => {
  const { close } = useModal();

  const { createCategoryAsync } = useCreateCategory();
  const { uploadImagesAsync, isLoading: isLoadingUpload } = useUploadImages();

  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);

  const form = useForm<CreateCategoryType>({
    resolver: zodResolver(CreateCategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      image_url: null,
      public_id: null,
    },
  });

  const isSubmitting = form.formState.isSubmitting || isLoadingUpload;

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImages(images);
  };

  // const handleParentCategoryChange = (value: string) => {
  //   const parentId = value === "clear" || value === "" ? null : value;
  //   form.setValue("parent_id", parentId);
  // };

  const handleFormSubmit = async (values: CreateCategoryType) => {
    if (selectedImages.length === 0) {
      toast.error("Please select an image for the category");
      return;
    }

    try {
      const uploadResult = await uploadImagesAsync({
        images: [selectedImages[0].base64Url],
      });

      const uploadedImage = uploadResult.data[0];

      values.image_url = uploadedImage.imageUrl;
      values.public_id = uploadedImage.publicId;

      await createCategoryAsync(values);
      form.reset();
      setSelectedImages([]);
      close();
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    }
  };

  // const renderParentCategoryOptions = () => {
  //   if (activeCategories.length === 0) {
  //     return (
  //       <SelectItem value="empty" disabled>
  //         No categories available
  //       </SelectItem>
  //     );
  //   }

  //   return (
  //     <>
  //       <SelectItem value="clear">No parent category</SelectItem>
  //       {activeCategories.map((category) => (
  //         <SelectItem key={category.id} value={category.id.toString()}>
  //           {category.name}
  //         </SelectItem>
  //       ))}
  //     </>
  //   );
  // };

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
