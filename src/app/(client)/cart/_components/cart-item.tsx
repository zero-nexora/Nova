import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/stores/client/carts-store";
import { useConfirm } from "@/stores/confirm-store";
import { formatUSD } from "@/lib/utils";
import { placeholderImage } from "@/lib/constants";
import { CartItem as CartItemType } from "@/queries/client/carts/types";
import { useUpdateCartItem } from "../hooks/use-update-cart-item";
import { useDeleteCartItem } from "../hooks/use-delete-cart-item";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  onSelectItem: (itemId: string, checked: boolean) => void;
}

export const CartItem = ({ item, isSelected, onSelectItem }: CartItemProps) => {
  const { updateCartItemQuantity, deleteCartItem } = useCartStore();
  const { updateCartItemAsync } = useUpdateCartItem();
  const { deleteCartItemAsync, isPending: isDeleting } = useDeleteCartItem();
  const { open } = useConfirm();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  const debouncedQuantity = useDebounce(localQuantity, 500);

  useEffect(() => {
    if (debouncedQuantity !== item.quantity) {
      updateCartItemQuantity(item.id, debouncedQuantity);
      updateCartItemAsync({ cartItemId: item.id, quantity: debouncedQuantity });
    }
  }, [
    debouncedQuantity,
    item.id,
    item.quantity,
    updateCartItemAsync,
    updateCartItemQuantity,
  ]);

  const handleQuantityChange = async (change: number) => {
    const newQuantity = localQuantity + change;
    if (newQuantity < 1 || newQuantity > item.productVariant.stock_quantity)
      return;

    setLocalQuantity(newQuantity);
  };

  const handleDeleteItem = () => {
    open({
      title: "Remove Item",
      description: `Are you sure you want to remove "${item.productVariant.product.name}" from your cart?`,
      onConfirm: async () => {
        deleteCartItem(item.id);
        await deleteCartItemAsync({ cartItemId: item.id });
      },
    });
  };

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200 p-0">
      <CardContent className="flex sm:flex-row items-center gap-4 p-2">
        <Checkbox
          id={`item-${item.id}`}
          checked={isSelected}
          onCheckedChange={(checked: boolean) => onSelectItem(item.id, checked)}
          className="mt-2 sm:mt-0"
        />
        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
          <Image
            src={item.productVariant.product.image_url || placeholderImage}
            alt={item.productVariant.product.name}
            width={96}
            height={96}
            className="w-full h-full object-cover rounded-md border"
          />
        </div>
        <div className="flex-1 flex flex-row items-center justify-between gap-4 w-full">
          <div className="flex-1 space-y-1">
            <h3 className="text-base sm:text-lg font-semibold truncate">
              {item.productVariant.product.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Material:{" "}
              {item.productVariant.attributes
                .map((attr) => attr?.attributeValue?.value ?? "N/A")
                .join(", ")}
            </p>
            <p className="text-sm text-muted-foreground">
              Stock: {item.productVariant.stock_quantity} available
            </p>
            <p className="text-base font-medium">
              {formatUSD(item.productVariant.price)} x {localQuantity} ={" "}
              <span className="font-bold">
                {formatUSD(localQuantity * item.productVariant.price)}
              </span>
            </p>
            {localQuantity >= item.productVariant.stock_quantity && (
              <p className="text-xs text-destructive font-medium">
                Maximum stock reached ({item.productVariant.stock_quantity})
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:items-end">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={localQuantity <= 1}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center font-medium">
                {localQuantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={localQuantity >= item.productVariant.stock_quantity}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteItem}
              disabled={isDeleting}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CartItemSkeleton = () => {
  return (
    <div className="border shadow-sm rounded-md p-2">
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="w-20 h-20 rounded-md" />
        <div className="flex-1 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
};
