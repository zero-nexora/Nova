"use client";

import { useForm } from "react-hook-form";
import z from "zod";
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
  UpdateCategorySchema,
  UpdateCategoryType,
} from "@/queries/admin/categories/types";
import { CategoryRow } from "@/app/(admin)/admin/categories/_components/columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import ImageUploader from "../global/image-uploader";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import { useState } from "react";
import { ImagesPreview } from "../global/images-preview";
import { toast } from "sonner";
import {
  useRemoveImages,
  useUpdateCategory,
  useUploadImages,
} from "@/app/(admin)/admin/categories/hooks/custom-hook";
import { useModal } from "@/stores/modal-store";
import { Button } from "../ui/button";
import { Loading } from "../global/loading";

interface UpdateCategoryFormProps {
  data: CategoryRow;
}

export const UpdateCategoryForm = ({ data }: UpdateCategoryFormProps) => {
  const { close } = useModal();
  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);
  const { uploadImagesAsync, isLoading: isLoadingUpload } = useUploadImages();
  const { updateCategoryAsync } = useUpdateCategory();
  const { removeImagesAsync, isLoading: isLoadingRemoveImages } =
    useRemoveImages();

  const activeCategories = useCategoriesStore(
    (state) => state.activeCategories
  );

  const form = useForm<z.infer<typeof UpdateCategorySchema>>({
    defaultValues: {
      id: data.id,
      name: data.name,
      parent_id: data.parentId,
      public_id: data.public_id,
    },
    resolver: zodResolver(UpdateCategorySchema),
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleParentCategoryChange = (value: string) => {
    const parentId = value === "clear" || value === "" ? null : value;
    form.setValue("parent_id", parentId);
  };

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImages(images);
  };

  const renderParentCategoryOptions = () => {
    if (activeCategories.length === 0) {
      return (
        <SelectItem value="empty" disabled>
          No categories available
        </SelectItem>
      );
    }

    return (
      <>
        <SelectItem value="clear" disabled={data.id == null}>
          No parent category
        </SelectItem>
        {activeCategories.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id.toString()}
            // disabled={category.id === data.id}
          >
            {category.name}
          </SelectItem>
        ))}
      </>
    );
  };

  const onRemoveImage = async () => {
    try {
      if (data.public_id == null) {
        return;
      }
      await removeImagesAsync({ publicIds: [data.public_id] });
      form.setValue("image_url", null);
      form.setValue("public_id", null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove images");
    }
  };

  const handleFormSubmit = async (values: UpdateCategoryType) => {
    if (!data.image_url && selectedImages.length === 0) {
      toast.error("Please select an image for the category");
      return;
    }

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
      form.reset();
      setSelectedImages([]);
      close();
      toast.success("Category created successfully!");
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
          disabled={isSubmitting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                  disabled={isSubmitting || isLoadingRemoveImages}
                  onRemove={onRemoveImage}
                />
              )}
              {!form.getValues("image_url") && (
                <ImageUploader
                  multiple={false}
                  disabled={isSubmitting || isLoadingUpload}
                  onImagesChange={handleImageSelection}
                />
              )}
              {/* </FormControl> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parent_id"
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
