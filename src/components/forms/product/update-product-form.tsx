"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/global/loading";
import { ImageUploader } from "@/components/uploader/image-uploader";
import { ImagesPreview } from "@/components/uploader/images-preview";
import { Label } from "@/components/ui/label";

import { useModal } from "@/stores/modal-store";
import {
  ProductResponse,
  UpdateProductSchema,
  VariantInput,
} from "@/queries/admin/products/types";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";
import { MAX_FILES } from "@/lib/constants";
import {
  useDeleteImages,
  useUploadImages,
} from "@/components/uploader/hooks/use-uploader";
import { useUpdateProduct } from "@/app/(admin)/admin/products/hooks/products/use-update-product";
import { useGetAllProductAttributes } from "@/app/(admin)/admin/products/hooks/products/use-get-all-product-attributes";
import { useGetAllCategories } from "@/app/(admin)/admin/categories/hooks/categories/use-get-all-categories";
import { useProductVariants } from "@/app/(admin)/admin/products/hooks/products/use-product-variants";
import {
  deduplicateVariants,
  isValidUUID,
  ProductVariant,
  validateVariants,
} from "@/lib/utils";
import { ProductBasicFields } from "./product-basic-fields-form";
import { VariantFormSection } from "@/app/(admin)/admin/products/_components/variant-form-section";
import { useForm } from "react-hook-form";

interface UpdateProductFormProps {
  data: ProductResponse;
}

export function UpdateProductForm({ data }: UpdateProductFormProps) {
  const closeModal = useModal((state) => state.close);
  const { productAttributes } = useGetAllProductAttributes();
  const { categories } = useGetAllCategories();

  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();
  const { updateProductAsync, isPending: isUpdating } = useUpdateProduct();
  const { deleteImagesAsync } = useDeleteImages();

  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);
  const [imageIdsToRemove, setImagesIdToRemove] = useState<string[]>([]);
  const [imagePublicIdsToRemove, setImagesPublicIdsToRemove] = useState<
    string[]
  >([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    variants,
    setVariants,
    addVariant,
    removeVariant,
    updateVariant,
    updateAttributeValue,
    getSelectedAttributeValue,
  } = useProductVariants();

  const form = useForm<z.infer<typeof UpdateProductSchema>>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      id: data.id,
      description: data.description || "",
      name: data.name || "",
      variants: [],
      images:
        data.images?.map((img) => ({
          id: img.id,
          image_url: img.image_url,
          public_id: img.public_id,
        })) || [],
      categoryId: data.category.id,
      subcategoryId: data.subcategory?.id || undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (data.variants?.length > 0 && !isInitialized) {
      const initializedVariants: ProductVariant[] = data.variants.map(
        (variant) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          attributeValueIds:
            variant.attributes?.map((attr) => attr.attributeValue.id) || [],
          isExisting: true,
        })
      );

      setVariants(initializedVariants);
      setIsInitialized(true);
    }
  }, [data.variants, isInitialized, setVariants]);

  const isSubmitting =
    form.formState.isSubmitting || isLoadingUpload || isUpdating;
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

  const handleRemoveExistingImage = useCallback(
    (id: string) => {
      setImagesIdToRemove((prev) => [...prev, id]);
      const currentImages = form.getValues("images") || [];
      const publicId =
        currentImages.find((img) => img.id === id)?.public_id || "";
      setImagesPublicIdsToRemove((prev) => [...prev, publicId]);
      const updatedImages = currentImages.filter((img) => img.id !== id);
      form.setValue("images", updatedImages);
    },
    [form]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      if (categoryId !== data.category.id) {
        form.setValue("subcategoryId", undefined);
      }
    },
    [form, data.category.id]
  );

  const validateForm = useCallback(() => {
    const totalImages =
      (form.getValues("images")?.length || 0) + selectedImages.length;

    if (totalImages === 0) {
      toast.error("Please select at least one image for the product");
      return false;
    }

    return validateVariants(variants);
  }, [form, selectedImages, variants]);

  const prepareVariantsForSubmit = useCallback((): VariantInput[] => {
    const uniqueVariants = deduplicateVariants(variants);

    return uniqueVariants.map((variant): VariantInput => {
      const variantData: VariantInput = {
        sku: variant.sku,
        price: variant.price,
        stock_quantity: variant.stock_quantity,
        attributeValueIds: variant.attributeValueIds,
      };

      if (variant.isExisting && variant.id && isValidUUID(variant.id)) {
        variantData.id = variant.id;
      }

      return variantData;
    });
  }, [variants]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof UpdateProductSchema>) => {
      if (!validateForm()) return;

      if (imageIdsToRemove.length > 0) {
        await deleteImagesAsync({ publicIds: imagePublicIdsToRemove });
      }

      let newImages: { image_url: string; public_id: string }[] = [];
      if (selectedImages.length > 0) {
        const uploadResult = await uploadImagesAsync({
          images: selectedImages.map((image) => image.base64Url),
        });

        newImages = uploadResult.data.map(({ imageUrl, publicId }) => ({
          image_url: imageUrl,
          public_id: publicId,
        }));
      }

      const existingImages = form.getValues("images") || [];
      values.images = [...existingImages, ...newImages];

      values.variants = prepareVariantsForSubmit();

      await updateProductAsync(values);
      closeModal();
    },
    [
      validateForm,
      imageIdsToRemove,
      imagePublicIdsToRemove,
      selectedImages,
      form,
      deleteImagesAsync,
      uploadImagesAsync,
      prepareVariantsForSubmit,
      updateProductAsync,
      closeModal,
    ]
  );

  const renderImageSection = useCallback(() => {
    const existingImages = form.getValues("images") || [];
    const filteredExistingImages = existingImages.filter(
      (img) => img.id && !imageIdsToRemove.includes(img.id)
    );
    const previewList = filteredExistingImages.map((image) => ({
      id: image.id || "",
      url: image.image_url || "",
    }));

    return (
      <div className="space-y-4">
        {filteredExistingImages.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Current Images
            </Label>
            <ImagesPreview
              previewList={previewList}
              disabled={isSubmitting}
              onRemove={handleRemoveExistingImage}
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block">
            {filteredExistingImages.length > 0
              ? "Add More Images"
              : "Upload Images"}
          </Label>
          <FormControl>
            <ImageUploader
              maxFiles={
                filteredExistingImages.length > 0
                  ? MAX_FILES - filteredExistingImages.length
                  : MAX_FILES
              }
              multiple={true}
              disabled={isSubmitting}
              onImagesChange={handleImageSelection}
            />
          </FormControl>
        </div>
      </div>
    );
  }, [
    form,
    imageIdsToRemove,
    isSubmitting,
    handleRemoveExistingImage,
    handleImageSelection,
  ]);

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
              {renderImageSection()}
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
          <Button disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Loading /> : "Update Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
