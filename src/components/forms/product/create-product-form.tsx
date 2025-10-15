import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import { ImageUploader } from "@/components/uploader/image-uploader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreateProductSchema } from "@/queries/admin/products/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Loading } from "@/components/global/loading";
import { useModal } from "@/stores/modal-store";
import { useUploadImages } from "@/components/uploader/hooks/use-uploader";
import { useCreateProduct } from "@/app/(admin)/admin/products/hooks/products/use-create-product";
import { useGetAllProductAttributes } from "@/app/(admin)/admin/products/hooks/products/use-get-all-product-attributes";
import { useGetAllCategories } from "@/app/(admin)/admin/categories/hooks/categories/use-get-all-categories";
import { useProductVariants } from "@/app/(admin)/admin/products/hooks/products/use-product-variants";
import { deduplicateVariants, validateVariants } from "@/lib/utils";
import { ProductBasicFields } from "./product-basic-fields-form";
import { VariantFormSection } from "@/app/(admin)/admin/products/_components/variant-form-section";

export const CreateProductForm = () => {
  const closeModal = useModal((state) => state.close);
  const { productAttributes } = useGetAllProductAttributes();
  const { categories } = useGetAllCategories();
  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();
  const { createProductAsync } = useCreateProduct();

  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);

  const {
    variants,
    addVariant,
    removeVariant,
    updateVariant,
    updateAttributeValue,
    getSelectedAttributeValue,
    resetVariants,
  } = useProductVariants();

  const form = useForm<z.infer<typeof CreateProductSchema>>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      description: "",
      name: "",
      variants: [],
      images: [],
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting || isLoadingUpload;
  const selectedCategoryId = form.watch("categoryId");
  const productName = form.watch("name");

  const subcategories = useMemo(
    () =>
      categories.find((c) => c.id === selectedCategoryId)?.subcategories || [],
    [categories, selectedCategoryId]
  );

  const handleImageSelection = useCallback((images: LocalImagePreview[]) => {
    setSelectedImages(images);
  }, []);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      if (categoryId !== selectedCategoryId) {
        form.setValue("subcategoryId", undefined);
      }
    },
    [form, selectedCategoryId]
  );

  const resetForm = useCallback(() => {
    form.reset({
      description: "",
      name: "",
      variants: [],
      images: [],
    });
    setSelectedImages([]);
    resetVariants();
  }, [form, resetVariants]);

  const validateForm = useCallback(() => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image for the product");
      return false;
    }

    return validateVariants(variants);
  }, [selectedImages, variants]);

  const onSubmit = async (values: z.infer<typeof CreateProductSchema>) => {
    if (!validateForm()) return;

    const uniqueVariants = deduplicateVariants(variants);
    values.variants = uniqueVariants.map(({ id, ...variant }) => variant);

    const uploadResult = await uploadImagesAsync({
      images: selectedImages.map((image) => image.base64Url),
    });

    values.images = uploadResult.data.map(({ imageUrl, publicId }) => ({
      image_url: imageUrl,
      public_id: publicId,
    }));

    await createProductAsync(values);
    resetForm();
    closeModal();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ProductBasicFields
          form={form}
          categories={categories}
          subcategories={subcategories}
          isSubmitting={isSubmitting}
          onCategoryChange={handleCategoryChange}
        />

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Product Images *</FormLabel>
              <FormControl>
                <ImageUploader
                  multiple={true}
                  disabled={isSubmitting}
                  onImagesChange={handleImageSelection}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <VariantFormSection
          variants={variants}
          productName={productName}
          isSubmitting={isSubmitting}
          productAttributes={productAttributes}
          onAddVariant={addVariant}
          onRemoveVariant={removeVariant}
          onUpdateVariant={updateVariant}
          onAttributeValueChange={updateAttributeValue}
          getSelectedAttributeValue={getSelectedAttributeValue}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Loading /> : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
