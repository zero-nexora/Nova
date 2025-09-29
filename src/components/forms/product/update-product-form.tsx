"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/global/loading";
import { ImageUploader } from "@/components/uploader/image-uploader";
import { ImagesPreview } from "@/components/uploader/images-preview";

import { Plus, DollarSign, Hash, Warehouse, X } from "lucide-react";

import { useCategoriesStore } from "@/stores/admin/categories-store";
import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";
import { useModal } from "@/stores/modal-store";

import {
  Product,
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
import { Label } from "@/components/ui/label";

// Types
interface ProductVariant extends VariantInput {
  isExisting?: boolean;
}

interface UpdateProductFormProps {
  data: Product;
}

export function UpdateProductForm({ data }: UpdateProductFormProps) {
  const closeModal = useModal((state) => state.close);
  const categories = useCategoriesStore((state) => state.categories);
  const productAttributes = useProductAttributesStore(
    (state) => state.productAttributes
  );

  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();
  const { updateProductAsync, isPending: isUpdating } = useUpdateProduct();
  const { deleteImagesAsync } = useDeleteImages();

  // State
  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);
  const [imageIdsToRemove, setImagesIdToRemove] = useState<string[]>([]);
  const [imagePublicIdsToRemove, setImagesPublicIdsToRemove] = useState<
    string[]
  >([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<z.infer<typeof UpdateProductSchema>>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      id: data.id,
      description: data.description || "",
      name: data.name,
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
      const initializedVariants = data.variants.map(
        (variant): ProductVariant => {
          const attributeValueIds =
            variant.attributes?.map(
              (variantAttr) => variantAttr.attributeValue.id
            ) || [];

          return {
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            attributeValueIds,
            isExisting: true,
          };
        }
      );

      setVariants(initializedVariants);
      setIsInitialized(true);
    } else if (!isInitialized) {
      const defaultVariant: ProductVariant = {
        id: `new_${Date.now()}`,
        sku: "",
        price: 0,
        stock_quantity: 0,
        attributeValueIds: [],
        isExisting: false,
      };
      setVariants([defaultVariant]);
      setIsInitialized(true);
    }
  }, [data.variants, isInitialized]);

  const isSubmitting =
    form.formState.isSubmitting || isLoadingUpload || isUpdating;
  const selectedCategoryId = form.watch("categoryId");

  const subcategories = useMemo(
    () =>
      categories.find((c) => c.id === selectedCategoryId)?.subcategories || [],
    [categories, selectedCategoryId]
  );

  const addVariant = useCallback(() => {
    const newVariant: ProductVariant = {
      id: `new_${Date.now()}`,
      sku: "",
      price: 0,
      stock_quantity: 0,
      attributeValueIds: [],
      isExisting: false,
    };
    setVariants((prev) => [...prev, newVariant]);
  }, []);

  const deleteVariant = useCallback((variantId: string) => {
    setVariants((prev) =>
      prev.length > 1 ? prev.filter((v) => v.id !== variantId) : prev
    );
  }, []);

  const updateVariant = useCallback(
    (variantId: string, field: keyof ProductVariant, value: any) => {
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
      );
    },
    []
  );

  const handleAttributeValueChange = useCallback(
    (variantId: string, attributeId: string, valueId: string) => {
      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id !== variantId) return variant;

          const attribute = productAttributes.find(
            (attr) => attr.id === attributeId
          );
          if (!attribute) return variant;

          const existingValueIds = attribute.values.map((v) => v.id);
          const filteredIds = variant.attributeValueIds.filter(
            (id) => !existingValueIds.includes(id)
          );

          if (valueId && valueId !== "none") {
            filteredIds.push(valueId);
          }

          return { ...variant, attributeValueIds: filteredIds };
        })
      );
    },
    [productAttributes]
  );

  const getSelectedAttributeValue = useCallback(
    (variantId: string, attributeId: string) => {
      const variant = variants.find((v) => v.id === variantId);
      if (!variant || !variant.attributeValueIds) return "none";

      const attribute = productAttributes.find(
        (attr) => attr.id === attributeId
      );
      if (!attribute || !attribute.values) return "none";

      const selectedValueId = variant.attributeValueIds.find((valueId) =>
        attribute.values.some((v) => v.id === valueId)
      );

      if (
        selectedValueId &&
        attribute.values.some((v) => v.id === selectedValueId)
      ) {
        return selectedValueId;
      }

      return "none";
    },
    [variants, productAttributes]
  );

  const handleImageSelection = useCallback((images: LocalImagePreview[]) => {
    setSelectedImages(images);
  }, []);

  const handleRemoveExistingImage = useCallback(
    (id: string) => {
      setImagesIdToRemove((prev) => [...prev, id]);
      const currentImages = form.getValues("images") || [];
      setImagesPublicIdsToRemove((prev) => [
        ...prev,
        currentImages.find((img) => img.id === id)?.public_id || "",
      ]);
      const updatedImages = currentImages.filter((img) => img.id !== id);
      form.setValue("images", updatedImages);
    },
    [form]
  );

  const generateSKU = useCallback((baseProductName: string, index: number) => {
    const productPrefix = baseProductName
      .toUpperCase()
      .replace(/\s+/g, "-")
      .substring(0, 6);
    return `${productPrefix}-${String(index + 1).padStart(3, "0")}`;
  }, []);

  const validateForm = useCallback(() => {
    const totalImages =
      (form.getValues("images")?.length || 0) + selectedImages.length;

    if (totalImages === 0) {
      toast.error("Please select at least one image for the product");
      return false;
    }

    if (variants.length === 0) {
      toast.error("Please create at least one product variant");
      return false;
    }

    for (const variant of variants) {
      if (!variant.sku.trim()) {
        toast.error("All variants must have a SKU");
        return false;
      }
      if (variant.price <= 0) {
        toast.error("All variants must have a valid price");
        return false;
      }
      if (variant.stock_quantity < 0) {
        toast.error("Stock quantity cannot be negative");
        return false;
      }
    }

    return true;
  }, [form, selectedImages, variants]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof UpdateProductSchema>) => {
      if (!validateForm()) return;

      try {
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

        values.variants = variants.map((variant): VariantInput => {
          const variantData: VariantInput = {
            sku: variant.sku,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            attributeValueIds: variant.attributeValueIds,
          };

          if (
            variant.isExisting &&
            variant.id &&
            variant.id.match(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
          ) {
            variantData.id = variant.id;
          }

          return variantData;
        });

        await updateProductAsync(values);
        closeModal();
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("Failed to update product. Please try again.");
      }
    },
    [
      validateForm,
      imageIdsToRemove,
      selectedImages,
      variants,
      form,
      deleteImagesAsync,
      uploadImagesAsync,
      updateProductAsync,
      closeModal,
      imagePublicIdsToRemove,
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter product name"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="min-h-[120px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== data.category.id) {
                    form.setValue("subcategoryId", undefined);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => !c.is_deleted)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subcategory */}
        {selectedCategoryId && subcategories.length > 0 && (
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? undefined : value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {subcategories
                      .filter((subcategory) => !subcategory.is_deleted)
                      .map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Images */}
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

        {/* Variants */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium">Product Variants *</h2>
          <Button
            type="button"
            onClick={addVariant}
            variant="outline"
            size="sm"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>
        <div className="space-y-6">
          {variants.map((variant, index) => (
            <div key={variant.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Variant {index + 1}</h3>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => deleteVariant(variant.id!)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Basic variant info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Hash className="h-3 w-3" />
                    SKU *
                  </Label>
                  <Input
                    placeholder={
                      form.watch("name")
                        ? generateSKU(form.watch("name") || "", index)
                        : "Enter SKU"
                    }
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(variant.id!, "sku", e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <DollarSign className="h-3 w-3" />
                    Price *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.price || ""}
                    onChange={(e) =>
                      updateVariant(
                        variant.id!,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Warehouse className="h-3 w-3" />
                    Stock *
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={variant.stock_quantity || ""}
                    onChange={(e) =>
                      updateVariant(
                        variant.id!,
                        "stock_quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Attributes */}
              {productAttributes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Attributes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productAttributes.map((attribute) => {
                        const selectedValue = getSelectedAttributeValue(
                          variant.id!,
                          attribute.id
                        );

                        // Tìm value đã chọn để hiển thị tên trong SelectTrigger
                        const selectedValueObj = attribute.values.find(
                          (val) => val.id === selectedValue
                        );
                        const displayText = selectedValueObj
                          ? selectedValueObj.value
                          : "Select value";

                        return (
                          <div key={attribute.id}>
                            <Label className="text-xs font-medium text-gray-600 mb-1 block">
                              {attribute.name}
                            </Label>
                            <Select
                              value={selectedValue}
                              onValueChange={(value) =>
                                handleAttributeValueChange(
                                  variant.id!,
                                  attribute.id,
                                  value
                                )
                              }
                              disabled={isSubmitting}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select value">
                                  {selectedValue !== "none"
                                    ? displayText
                                    : "Select value"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {attribute.values.map((value) => (
                                  <SelectItem key={value.id} value={value.id}>
                                    {value.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>

                    {variant.attributeValueIds &&
                      variant.attributeValueIds.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-600 mb-2">
                            Selected:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {variant.attributeValueIds
                              .map((valueId) => {
                                const value = productAttributes
                                  .flatMap((attr) => attr.values)
                                  .find((val) => val.id === valueId);
                                const attribute = productAttributes.find(
                                  (attr) =>
                                    attr.values.some(
                                      (val) => val.id === valueId
                                    )
                                );

                                return value && attribute ? (
                                  <Badge
                                    key={valueId}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {attribute.name}: {value.value}
                                  </Badge>
                                ) : null;
                              })
                              .filter(Boolean)}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Loading /> : "Update Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
