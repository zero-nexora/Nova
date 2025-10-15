"use client";

import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loading } from "../../global/loading";
import { useModal } from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUploader } from "../../uploader/image-uploader";
import { ImagesPreview } from "../../uploader/images-preview";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import {
  Category,
  UpdateCategorySchema,
  UpdateCategoryType,
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
import {
  useDeleteImage,
  useUploadImage,
} from "@/components/uploader/hooks/use-uploader";
import { useUpdateCategory } from "@/app/(admin)/admin/categories/hooks/categories/use-update-category";

interface UpdateCategoryFormProps {
  data: Category;
}

export const UpdateCategoryForm = ({ data }: UpdateCategoryFormProps) => {
  const { close } = useModal();
  const [selectedImage, setSelectedImage] = useState<LocalImagePreview | null>(
    null
  );
  const { uploadImageAsync, isPending: isUploadingImage } = useUploadImage();
  const { updateCategoryAsync } = useUpdateCategory();
  const { deleteImageAsync, isPending: isDeletingImage } = useDeleteImage();

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

  const isLoading = useMemo(
    () => form.formState.isLoading || isUploadingImage || isDeletingImage,
    [form.formState.isLoading, isUploadingImage, isDeletingImage]
  );

  const previewList = [{ id: data.id, url: form.getValues("image_url") || "" }];

  const hasExistingImage = useMemo(
    () => Boolean(form.getValues("image_url")),
    [form]
  );

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImage(images[0]);
  };

  const handleDeleteImage = async () => {
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
      toast.error("Failed to remove image");
    }
  };

  const formReset = () => {
    form.reset({
      id: data.id,
      name: data.name || "",
      public_id: null,
      image_url: null,
    });
    setSelectedImage(null);
  };

  const handleFormSubmit = async (values: UpdateCategoryType) => {
    if (selectedImage) {
      const uploadResult = await uploadImageAsync({
        image: selectedImage.base64Url,
      });
      const uploadedImage = uploadResult.data;
      values.image_url = uploadedImage.imageUrl;
      values.public_id = uploadedImage.publicId;
    }

    await updateCategoryAsync(values);

    formReset();
    close();
  };

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
              {renderImageSection()}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[140px] ml-auto"
        >
          {isLoading ? <Loading /> : "Update Category"}
        </Button>
      </form>
    </Form>
  );
};
