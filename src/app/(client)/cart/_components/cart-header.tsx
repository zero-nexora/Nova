import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useConfirm } from "@/stores/confirm-store";
import { useCartStore } from "@/stores/client/carts-store";
import { Cart } from "@/queries/client/carts/types";
import { useClearCart } from "../hooks/use-clear-cart";
import { Skeleton } from "@/components/ui/skeleton";

interface CartHeaderProps {
  cart: Cart;
  selectedItems: string[];
  onSelectAll: (checked: boolean) => void;
}

export const CartHeader = ({
  cart,
  selectedItems,
  onSelectAll,
}: CartHeaderProps) => {
  const { clearCart } = useCartStore();
  const { clearCartAsync, isPending: isClearing } = useClearCart();
  const { open } = useConfirm();

  const handleClearCart = () => {
    open({
      title: "Clear Cart",
      description: "Are you sure you want to remove all items from your cart?",
      onConfirm: async () => {
        clearCart();
        await clearCartAsync();
      },
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Checkbox
          id="select-all"
          checked={selectedItems.length === cart.items.length}
          onCheckedChange={onSelectAll}
        />
        <Label htmlFor="select-all" className="text-sm font-medium">
          Select All ({selectedItems.length}/{cart.items.length})
        </Label>
      </div>
      <Button
        variant="outline"
        onClick={handleClearCart}
        disabled={isClearing}
        className="w-full sm:w-auto"
      >
        Clear Cart
      </Button>
    </div>
  );
};

export const CartHeaderSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-full sm:w-24" />
    </div>
  );
};
