"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loading } from "../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUploader } from "../global/image-uploader";
import { ImagesPreview } from "../global/images-preview";
import { Category } from "@/stores/admin/categories-store";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import {
  UpdateCategorySchema,
  UpdateCategoryType,
} from "@/queries/admin/categories/types";
import {
  useRemoveImages,
  useUpdateCategory,
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

interface UpdateCategoryFormProps {
  data: Category;
}

export const UpdateCategoryForm = ({ data }: UpdateCategoryFormProps) => {
  const { close } = useModal();
  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);
  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();
  const { updateCategoryAsync } = useUpdateCategory();
  const { removeImagesAsync, isPending: isLoadingRemoveImages } =
    useRemoveImages();

  const form = useForm<UpdateCategoryType>({
    resolver: zodResolver(UpdateCategorySchema),
    mode: "onChange",
    defaultValues: {
      id: data.id,
      name: data.name || "",
      public_id: data.public_id || null,
      image_url: data.image_url || null,
    },
  });

  const isSubmitting =
    form.formState.isSubmitting || isLoadingUpload || isLoadingRemoveImages;

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImages(images);
  };

  const onRemoveImage = async () => {
    try {
      if (!data.public_id) {
        toast.error("No image to remove");
        return;
      }
      await removeImagesAsync({ publicIds: [data.public_id] });
      form.setValue("image_url", null);
      form.setValue("public_id", null);
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  const handleFormSubmit = async (values: UpdateCategoryType) => {
    try {
      if (selectedImages.length > 0) {
        const uploadResult = await uploadImagesAsync({
          images: [selectedImages[0].base64Url],
        });
        const uploadedImage = uploadResult.data[0];
        values.image_url = uploadedImage.imageUrl;
        values.public_id = uploadedImage.publicId;
      }

      await updateCategoryAsync(values);
      form.reset({
        id: data.id,
        name: data.name || "",
        public_id: null,
        image_url: null,
      });
      setSelectedImages([]);
      close();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
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
              <FormLabel>Name *</FormLabel>
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
              {form.getValues("image_url") && (
                <ImagesPreview
                  previewList={[
                    { id: data.id, url: form.getValues("image_url") as string },
                  ]}
                  disabled={isSubmitting}
                  onRemove={onRemoveImage}
                />
              )}
              {!form.getValues("image_url") && (
                <FormControl>
                  <ImageUploader
                    multiple={false}
                    disabled={isSubmitting}
                    onImagesChange={handleImageSelection}
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[140px] ml-auto"
        >
          {isSubmitting ? <Loading /> : "Update Category"}
        </Button>
      </form>
    </Form>
  );
};
