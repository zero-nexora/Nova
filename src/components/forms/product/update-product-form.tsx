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
import { ImageUploader } from "@/components/global/image-uploader";
import { ImagesPreview } from "@/components/global/images-preview";

import { Plus, DollarSign, Hash, Warehouse, X, Info } from "lucide-react";

import { useCategoriesStore } from "@/stores/admin/categories-store";
import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";
import { useModal } from "@/stores/modal-store";

import { UpdateProductSchema } from "@/queries/admin/products/types";
import { ProductTable } from "@/app/(admin)/admin/products/hooks/types";
import {
  useRemoveImages,
  useUploadImages,
} from "@/app/(admin)/admin/categories/hooks/custom-hook-category";
import { useUpdateProduct } from "@/app/(admin)/admin/products/hooks/custom-hook-product";
import { LocalImagePreview } from "@/app/(admin)/admin/categories/hooks/types";

// Types
interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributeValueIds: string[];
  isExisting?: boolean;
}

interface UpdateProductFormProps {
  data: ProductTable;
}

export function UpdateProductForm({ data }: UpdateProductFormProps) {
  const closeModal = useModal((state) => state.close);
  const categories = useCategoriesStore((state) => state.categories);
  const productAttributes = useProductAttributesStore(
    (state) => state.productAttributes
  );

  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();
  const { updateProductAsync, isPending: isUpdating } = useUpdateProduct();
  const { removeImagesAsync } = useRemoveImages();

  // State
  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Form configuration
  const form = useForm<z.infer<typeof UpdateProductSchema>>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      id: data.id,
      description: data.description || "",
      name: data.name,
      variants: [],
      images:
        data.images?.map((img) => ({
          image_url: img.image_url,
          public_id: img.public_id,
        })) || [],
      categoryId: data.category_id,
      subcategoryId: data.subcategory_id || undefined,
    },
    mode: "onChange",
  });

  // Initialize variants with existing data
  useEffect(() => {
    if (data.variants?.length > 0 && !isInitialized) {
      const initializedVariants = data.variants.map((variant) => {
        // Extract attribute value IDs from nested variant_attributes
        const attributeValueIds =
          variant.variant_attributes?.map(
            (variantAttr) => variantAttr.attribute_value_id
          ) || [];

        return {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          attributeValueIds,
          isExisting: true,
        };
      });

      setVariants(initializedVariants);
      setIsInitialized(true);
    }
  }, [data.variants, isInitialized]);

  // Computed values
  const isSubmitting =
    form.formState.isSubmitting || isLoadingUpload || isUpdating;
  const selectedCategoryId = form.watch("categoryId");

  const subcategories = useMemo(
    () =>
      categories.find((c) => c.id === selectedCategoryId)?.subcategories || [],
    [categories, selectedCategoryId]
  );

  // Variant management
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

  const removeVariant = useCallback((variantId: string) => {
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

  // Attribute management
  const handleAttributeValueChange = useCallback(
    (variantId: string, attributeId: string, valueId: string) => {
      setVariants((prev) =>
        prev.map((variant) => {
          if (variant.id !== variantId) return variant;

          const attribute = productAttributes.find(
            (attr) => attr.id === attributeId
          );
          if (!attribute) return variant;

          // Remove existing values for this attribute
          const existingValueIds = attribute.values.map((v) => v.id);
          const filteredIds = variant.attributeValueIds.filter(
            (id) => !existingValueIds.includes(id)
          );

          // Add new value if not "none"
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
      if (!variant) return "";

      const attribute = productAttributes.find(
        (attr) => attr.id === attributeId
      );
      if (!attribute) return "";

      const selectedValueId = variant.attributeValueIds.find((valueId) =>
        attribute.values.some((v) => v.id === valueId)
      );

      return selectedValueId || "";
    },
    [variants, productAttributes]
  );

  // Get variant attributes for display
  const getVariantAttributesDisplay = useCallback(
    (variant: ProductVariant) => {
      if (!variant.attributeValueIds.length) return [];

      return variant.attributeValueIds
        .map((valueId) => {
          const attribute = productAttributes.find((attr) =>
            attr.values.some((val) => val.id === valueId)
          );
          const value = productAttributes
            .flatMap((attr) => attr.values)
            .find((val) => val.id === valueId);

          return attribute && value
            ? {
                attributeName: attribute.name,
                valueName: value.value,
                valueId: valueId,
              }
            : null;
        })
        .filter(Boolean);
    },
    [productAttributes]
  );

  // Get existing attributes from original data
  const getExistingVariantAttributes = useCallback(
    (variantId: string) => {
      const originalVariant = data.variants?.find((v) => v.id === variantId);
      if (!originalVariant?.variant_attributes) return [];

      return originalVariant.variant_attributes.map((variantAttr) => ({
        attributeName: variantAttr.attribute.name,
        valueName: variantAttr.attribute_value.value,
        valueId: variantAttr.attribute_value_id,
      }));
    },
    [data.variants]
  );

  // Image management
  const handleImageSelection = useCallback((images: LocalImagePreview[]) => {
    setSelectedImages(images);
  }, []);

  const handleRemoveExistingImage = useCallback(
    (publicId: string) => {
      setImagesToRemove((prev) => [...prev, publicId]);
      const currentImages = form.getValues("images") || [];
      const updatedImages = currentImages.filter(
        (img) => img.public_id !== publicId
      );
      form.setValue("images", updatedImages);
    },
    [form]
  );

  // Utility functions
  const generateSKU = useCallback((baseProductName: string, index: number) => {
    const productPrefix = baseProductName
      .toUpperCase()
      .replace(/\s+/g, "-")
      .substring(0, 6);
    return `${productPrefix}-${String(index + 1).padStart(3, "0")}`;
  }, []);

  const validateForm = useCallback(() => {
    const totalImages =
      (form.getValues("images")?.length || 0) +
      selectedImages.length -
      imagesToRemove.length;

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
  }, [form, selectedImages, imagesToRemove, variants]);

  // Form submission
  const onSubmit = useCallback(
    async (values: z.infer<typeof UpdateProductSchema>) => {
      if (!validateForm()) return;

      try {
        // Remove images marked for deletion
        if (imagesToRemove.length > 0) {
          await removeImagesAsync({ publicIds: imagesToRemove });
        }

        // Upload new images
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

        // Combine existing and new images
        const existingImages = form.getValues("images") || [];
        values.images = [...existingImages, ...newImages];

        // Prepare variants
        values.variants = variants.map(
          ({ attributeValueIds, isExisting, ...variant }) => ({
            ...variant,
            attributes: attributeValueIds
              .map((valueId) => {
                const attribute = productAttributes.find((attr) =>
                  attr.values.some((v) => v.id === valueId)
                );
                return {
                  attribute_id: attribute?.id,
                  attribute_value_id: valueId,
                };
              })
              .filter((attr) => attr.attribute_id),
          })
        );

        await updateProductAsync(values);
        closeModal();
        toast.success("Product updated successfully");
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("Failed to update product. Please try again.");
      }
    },
    [
      validateForm,
      imagesToRemove,
      selectedImages,
      variants,
      productAttributes,
      form,
      removeImagesAsync,
      uploadImagesAsync,
      updateProductAsync,
      closeModal,
    ]
  );

  // Image section rendering
  const renderImageSection = useCallback(() => {
    const existingImages = form.getValues("images") || [];
    const filteredExistingImages = existingImages.filter(
      (img) => img.public_id && !imagesToRemove.includes(img.public_id)
    );

    return (
      <div className="space-y-4">
        {filteredExistingImages.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Current Images
            </label>
            <ImagesPreview
              previewList={filteredExistingImages.map((image) => ({
                id: image.public_id || "",
                url: image.image_url || "",
              }))}
              disabled={isSubmitting}
              onRemove={handleRemoveExistingImage}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">
            {filteredExistingImages.length > 0
              ? "Add More Images"
              : "Upload Images"}
          </label>
          <FormControl>
            <ImageUploader
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
    imagesToRemove,
    isSubmitting,
    handleRemoveExistingImage,
    handleImageSelection,
  ]);

  // Variant attributes section
  const renderVariantAttributesSection = useCallback(
    (variant: ProductVariant, index: number) => {
      if (productAttributes.length === 0) return null;

      const currentAttributesDisplay = getVariantAttributesDisplay(variant);
      const existingAttributesDisplay = variant.isExisting
        ? getExistingVariantAttributes(variant.id)
        : [];

      return (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Attributes</h4>
              {variant.isExisting && (
                <Badge variant="outline" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  Existing
                </Badge>
              )}
            </div>

            {/* Show existing attributes from original data */}
            {variant.isExisting && existingAttributesDisplay.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-blue-800 mb-2">
                  Original Attributes:
                </div>
                <div className="flex flex-wrap gap-2">
                  {existingAttributesDisplay.map((attr) => (
                    <Badge
                      key={attr.valueId}
                      variant="default"
                      className="text-xs bg-blue-100 text-blue-800"
                    >
                      {attr.attributeName}: {attr.valueName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Attribute selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productAttributes.map((attribute) => {
                const selectedValue = getSelectedAttributeValue(
                  variant.id,
                  attribute.id
                );

                return (
                  <div key={attribute.id}>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      {attribute.name}
                    </label>
                    <Select
                      value={selectedValue || "none"}
                      onValueChange={(value) =>
                        handleAttributeValueChange(
                          variant.id,
                          attribute.id,
                          value
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {attribute.values
                          .filter((val) => !val.is_deleted)
                          .map((value) => (
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

            {/* Current selected attributes */}
            {currentAttributesDisplay.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs font-medium text-green-800 mb-2">
                  Current Selection:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentAttributesDisplay.map((attr) => (
                    <Badge
                      key={attr?.valueId}
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800"
                    >
                      {attr?.attributeName}: {attr?.valueName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state for existing variants */}
            {variant.isExisting &&
              existingAttributesDisplay.length === 0 &&
              currentAttributesDisplay.length === 0 && (
                <div className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">
                  This variant has no attributes assigned
                </div>
              )}
          </div>
        </>
      );
    },
    [
      productAttributes,
      getVariantAttributesDisplay,
      getExistingVariantAttributes,
      getSelectedAttributeValue,
      handleAttributeValueChange,
      isSubmitting,
    ]
  );

  // Variants rendering
  const renderVariants = useCallback(() => {
    if (variants.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No variants loaded yet. Click Add Variant to create one.</p>
        </div>
      );
    }

    return variants.map((variant, index) => (
      <div key={variant.id} className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Variant {index + 1}</h3>
            {variant.isExisting && (
              <Badge variant="outline" className="text-xs">
                Original
              </Badge>
            )}
          </div>
          {variants.length > 1 && (
            <Button
              type="button"
              onClick={() => removeVariant(variant.id)}
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
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <Hash className="h-3 w-3" />
              SKU *
            </label>
            <Input
              placeholder={
                form.watch("name") && !variant.isExisting
                  ? generateSKU(form.watch("name") || "", index)
                  : "Enter SKU"
              }
              value={variant.sku}
              onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <DollarSign className="h-3 w-3" />
              Price *
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={variant.price || ""}
              onChange={(e) =>
                updateVariant(
                  variant.id,
                  "price",
                  parseFloat(e.target.value) || 0
                )
              }
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-1 mb-2">
              <Warehouse className="h-3 w-3" />
              Stock *
            </label>
            <Input
              type="number"
              placeholder="0"
              value={variant.stock_quantity || ""}
              onChange={(e) =>
                updateVariant(
                  variant.id,
                  "stock_quantity",
                  parseInt(e.target.value) || 0
                )
              }
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Attributes section */}
        {renderVariantAttributesSection(variant, index)}
      </div>
    ));
  }, [
    variants,
    isSubmitting,
    removeVariant,
    form,
    generateSKU,
    updateVariant,
    renderVariantAttributesSection,
  ]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Product Name */}
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
                  if (value !== data.category_id) {
                    form.setValue("subcategoryId", undefined);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
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
                    {subcategories.map((sub) => (
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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

          <div className="space-y-6">{renderVariants()}</div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Loading /> : "Update Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
