// Reusable variant form section component
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, DollarSign, Hash, Warehouse, X } from "lucide-react";
import { generateSKU, ProductVariant } from "@/lib/utils";

interface VariantFormSectionProps {
  variants: ProductVariant[];
  productName: string;
  isSubmitting: boolean;
  productAttributes: any[];
  onAddVariant: () => void;
  onRemoveVariant: (variantId: string) => void;
  onUpdateVariant: (variantId: string, field: keyof ProductVariant, value: any) => void;
  onAttributeValueChange: (
    variantId: string,
    attributeId: string,
    valueId: string,
    attributeValues: any[]
  ) => void;
  getSelectedAttributeValue: (
    variantId: string,
    attributeId: string,
    productAttributes: any[]
  ) => string;
}

export const VariantFormSection = ({
  variants,
  productName,
  isSubmitting,
  productAttributes,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  onAttributeValueChange,
  getSelectedAttributeValue,
}: VariantFormSectionProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium">Product Variants *</h2>
        <Button
          type="button"
          onClick={onAddVariant}
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
                  onClick={() => onRemoveVariant(variant.id)}
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
                  placeholder={productName ? generateSKU(productName, index) : "Enter SKU"}
                  value={variant.sku}
                  onChange={(e) => onUpdateVariant(variant.id, "sku", e.target.value)}
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
                    onUpdateVariant(variant.id, "price", parseFloat(e.target.value) || 0)
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
                    onUpdateVariant(variant.id, "stock_quantity", parseInt(e.target.value) || 0)
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
                    {productAttributes.map((attribute) => {
                      const selectedValue = getSelectedAttributeValue(
                        variant.id,
                        attribute.id,
                        productAttributes
                      );

                      return (
                        <div key={attribute.id}>
                          <Label className="text-xs font-medium text-gray-600 mb-1 block">
                            {attribute.name}
                          </Label>
                          <Select
                            value={selectedValue || "none"}
                            onValueChange={(value) =>
                              onAttributeValueChange(
                                variant.id,
                                attribute.id,
                                value,
                                attribute.values
                              )
                            }
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {attribute.values.map((value: any) => (
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

                  {variant.attributeValueIds.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-2">Selected:</div>
                      <div className="flex flex-wrap gap-2">
                        {variant.attributeValueIds.map((valueId) => {
                          const value = productAttributes
                            .flatMap((attr) => attr.values)
                            .find((val: any) => val.id === valueId);
                          const attribute = productAttributes.find((attr) =>
                            attr.values.some((val: any) => val.id === valueId)
                          );

                          return value && attribute ? (
                            <Badge key={valueId} variant="secondary" className="text-xs">
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
    </>
  );
};