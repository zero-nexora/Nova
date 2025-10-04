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
import { CreateProductSchema } from "@/queries/admin/products/types";
import { useCategoriesStore } from "@/stores/admin/categories-store";
import { useProductAttributesStore } from "@/stores/admin/product-attribute-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Plus, DollarSign, Hash, Warehouse, X } from "lucide-react";
import { Loading } from "@/components/global/loading";
import { useModal } from "@/stores/modal-store";
import { useUploadImages } from "@/components/uploader/hooks/use-uploader";
import { useCreateProduct } from "@/app/(admin)/admin/products/hooks/products/use-create-product";
import { Label } from "@/components/ui/label";

type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributeValueIds: string[];
};

export const CreateProductForm = () => {
  const closeModal = useModal((state) => state.close);
  const productAttributes = useProductAttributesStore(
    (state) => state.productAttributes
  );

  const categories = useCategoriesStore((state) => state.categories);
  const { uploadImagesAsync, isPending: isLoadingUpload } = useUploadImages();
  const { createProductAsync } = useCreateProduct();

  const [selectedImages, setSelectedImages] = useState<LocalImagePreview[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "default",
      sku: "",
      price: 0,
      stock_quantity: 0,
      attributeValueIds: [],
    },
  ]);

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
  const subcategories =
    categories.find((c) => c.id === selectedCategoryId)?.subcategories || [];

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      sku: "",
      price: 0,
      stock_quantity: 0,
      attributeValueIds: [],
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter((v) => v.id !== variantId));
    }
  };

  const updateVariant = (
    variantId: string,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariants(
      variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleAttributeValueChange = (
    variantId: string,
    attributeId: string,
    valueId: string
  ) => {
    setVariants(
      variants.map((variant) => {
        if (variant.id === variantId) {
          const newAttributeValueIds = [...variant.attributeValueIds];

          const existingValueIds =
            productAttributes
              .find((attr) => attr.id === attributeId)
              ?.values.map((v) => v.id) || [];

          const filteredIds = newAttributeValueIds.filter(
            (id) => !existingValueIds.includes(id)
          );

          if (valueId && valueId !== "none") {
            filteredIds.push(valueId);
          }

          return { ...variant, attributeValueIds: filteredIds };
        }
        return variant;
      })
    );
  };

  const getSelectedAttributeValue = (
    variantId: string,
    attributeId: string
  ) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return "";

    const attribute = productAttributes.find((attr) => attr.id === attributeId);
    if (!attribute) return "";

    const selectedValueId = variant.attributeValueIds.find((valueId) =>
      attribute.values.some((v) => v.id === valueId)
    );

    return selectedValueId || "";
  };

  const handleImageSelection = (images: LocalImagePreview[]) => {
    setSelectedImages(images);
  };

  const generateSKU = (baseProductName: string, index: number) => {
    const productPrefix = baseProductName
      .toUpperCase()
      .replace(/\s+/g, "-")
      .substring(0, 6);

    return `${productPrefix}-${String(index + 1).padStart(3, "0")}`;
  };

  const resetForm = useCallback(() => {
    form.reset({
      description: "",
      name: "",
      variants: [],
      images: [],
    });
    setSelectedImages([]);
    setVariants([
      {
        id: "default",
        sku: "",
        price: 0,
        stock_quantity: 0,
        attributeValueIds: [],
      },
    ]);
  }, [form]);

  const onSubmit = async (values: z.infer<typeof CreateProductSchema>) => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image for the product");
      return;
    }

    if (variants.length === 0) {
      toast.error("Please create at least one product variant");
      return;
    }

    for (const variant of variants) {
      if (!variant.sku.trim()) {
        toast.error("All variants must have a SKU");
        return;
      }
      if (variant.price <= 0) {
        toast.error("All variants must have a valid price");
        return;
      }
      if (variant.stock_quantity < 0) {
        toast.error("Stock quantity cannot be negative");
        return;
      }
    }

    try {
      const uniqueVariantsMap = new Map<string, ProductVariant>();
      variants.forEach((variant) => {
        const key = variant.attributeValueIds.sort().join(",");
        uniqueVariantsMap.set(key, variant);
      });

      const uniqueVariants = Array.from(uniqueVariantsMap.values()).map(
        ({ id, ...variant }) => variant
      );

      if (uniqueVariants.length < variants.length) {
        toast.info(
          `Merged ${
            variants.length - uniqueVariants.length
          } duplicate variant(s)`
        );
      }

      values.variants = uniqueVariants;

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
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product. Please try again.");
    }
  };

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

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((category) => !category.is_deleted)
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

        {selectedCategoryId && subcategories.length > 0 && (
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory (optional)" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Hash className="h-3 w-3" />
                    SKU *
                  </Label>
                  <Input
                    placeholder={
                      form.watch("name")
                        ? generateSKU(form.watch("name"), index)
                        : "Enter SKU"
                    }
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(variant.id, "sku", e.target.value)
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
                        variant.id,
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
                        variant.id,
                        "stock_quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {productAttributes.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Attributes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productAttributes.map((attribute) => (
                        <div key={attribute.id}>
                          <Label className="text-xs font-medium text-gray-600 mb-1 block">
                            {attribute.name}
                          </Label>
                          <Select
                            value={getSelectedAttributeValue(
                              variant.id,
                              attribute.id
                            )}
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
                              {attribute.values.map((value) => (
                                <SelectItem key={value.id} value={value.id}>
                                  {value.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    {variant.attributeValueIds.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 mb-2">
                          Selected:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {variant.attributeValueIds.map((valueId) => {
                            const value = productAttributes
                              .flatMap((attr) => attr.values)
                              .find((val) => val.id === valueId);
                            const attribute = productAttributes.find((attr) =>
                              attr.values.some((val) => val.id === valueId)
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
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-32">
            {isSubmitting ? <Loading /> : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
