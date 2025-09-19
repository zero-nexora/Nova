"use client";

import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loading } from "../../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUploader } from "../../uploader/image-uploader";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import {
  CreateCategorySchema,
  CreateCategoryType,
} from "@/queries/admin/categories/types";

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
import { useCreateCategory } from "@/app/(admin)/admin/categories/hooks/categories/use-create-category";
import { useUploadImage } from "@/components/uploader/hooks/use-uploader";

export const CreateCategoryForm = () => {
  const { close } = useModal();

  const { createCategoryAsync } = useCreateCategory();
  const { uploadImageAsync, isPending: isUploadingImage } = useUploadImage();

  const [selectedImage, setSelectedImage] = useState<LocalImagePreview | null>(
    null
  );

  const form = useForm<CreateCategoryType>({
    resolver: zodResolver(CreateCategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      image_url: null,
      public_id: null,
    },
  });

  const isLoading = useMemo(
    () => form.formState.isSubmitting || isUploadingImage,
    [form.formState.isSubmitting, isUploadingImage]
  );

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImage(images[0]);
  };

  const resetForm = useCallback(() => {
    form.reset({
      name: "",
      public_id: null,
      image_url: null,
    });
    setSelectedImage(null);
  }, [form]);

  const handleFormSubmit = async (values: CreateCategoryType) => {
    if (!selectedImage) {
      toast.error("Please select an image for the category");
      return;
    }

    try {
      const uploadResult = await uploadImageAsync({
        image: selectedImage.base64Url,
      });

      const uploadedImage = uploadResult.data;

      values.image_url = uploadedImage.imageUrl;
      values.public_id = uploadedImage.publicId;

      await createCategoryAsync(values);

      resetForm();
      close();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
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
              <FormLabel>Category Name *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter category name"
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
          name="image_url"
          render={() => (
            <FormItem>
              <FormLabel>Category Image *</FormLabel>
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
          {isLoading ? <Loading /> : "Create Category"}
        </Button>
      </form>
    </Form>
  );
};
