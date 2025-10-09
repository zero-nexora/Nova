"use client";

import { useCartStore } from "@/stores/client/carts-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUpdateCartItem } from "./hooks/use-update-cart-item";
import { useClearCart } from "./hooks/use-clear-cart";
import { useDeleteCartItem } from "./hooks/use-delete-cart-item";
import { useMemo, useState } from "react"; // Added useState
import { formatUSD } from "@/lib/utils";
import { useConfirm } from "@/stores/confirm-store";
import { placeholderImage } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import { Label } from "@/components/ui/label"; // Assuming you have a Label component

const CartPage = () => {
  const { cart, updateCartItemQuantity, deleteCartItem, clearCart } =
    useCartStore();
  const { updateCartItemAsync, isPending: isUpdating } = useUpdateCartItem();
  const { clearCartAsync, isPending: isClearing } = useClearCart();
  const { deleteCartItemAsync, isPending: isDeleting } = useDeleteCartItem();
  const { open } = useConfirm();

  // State to manage selected items
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cart?.items.map((item) => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  // Handle individual item selection
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  // Calculate totals based on selected items
  const totals = useMemo(() => {
    if (!cart?.items.length) return { subtotal: 0, itemCount: 0 };

    const selectedTotals = cart.items.reduce(
      (acc, item) => {
        if (selectedItems.includes(item.id)) {
          acc.subtotal += item.quantity * item.productVariant.price;
          acc.itemCount += item.quantity;
        }
        return acc;
      },
      { subtotal: 0, itemCount: 0 }
    );

    return selectedTotals;
  }, [cart, selectedItems]);

  // Handle quantity change
  const handleQuantityChange = async (
    itemId: string,
    currentQuantity: number,
    change: number,
    stock: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1 || newQuantity > stock) return;

    updateCartItemQuantity(itemId, newQuantity);
    await updateCartItemAsync({ cartItemId: itemId, quantity: newQuantity });
  };

  // Handle delete item with confirmation
  const handleDeleteItem = (itemId: string, productName: string) => {
    open({
      title: "Remove Item",
      description: `Are you sure you want to remove "${productName}" from your cart?`,
      onConfirm: async () => {
        deleteCartItem(itemId);
        setSelectedItems((prev) => prev.filter((id) => id !== itemId)); // Remove from selected items
        await deleteCartItemAsync({ cartItemId: itemId });
      },
    });
  };

  // Handle clear cart with confirmation
  const handleClearCart = () => {
    open({
      title: "Clear Cart",
      description: "Are you sure you want to remove all items from your cart?",
      onConfirm: async () => {
        clearCart();
        setSelectedItems([]); // Clear selected items
        await clearCartAsync();
      },
    });
  };

  // Empty cart state
  if (!cart || !cart.items.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center py-12">
            <ShoppingBag className="w-12 h-12 mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-6">
              Add some products to get started
            </p>
            <Button asChild>
              <Link href="/" className="gap-2">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Checkbox
            id="select-all"
            checked={selectedItems.length === cart.items.length}
            onCheckedChange={handleSelectAll}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-200 p-0"
            >
              <CardContent className="flex sm:flex-row items-center gap-4 p-2">
                {/* Checkbox */}
                <Checkbox
                  id={`item-${item.id}`}
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectItem(item.id, checked)
                  }
                  className="mt-2 sm:mt-0"
                />

                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                  <Image
                    src={
                      item.productVariant.product.image_url || placeholderImage
                    }
                    alt={item.productVariant.product.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover rounded-md border"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-row items-center justify-between gap-4 w-full">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold truncate">
                      {item.productVariant.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Material:{" "}
                      {item.productVariant.attributes
                        .map((attr) => attr.attributeValue.value)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {item.productVariant.stock_quantity} available
                    </p>
                    <p className="text-base font-medium">
                      {formatUSD(item.productVariant.price)} x {item.quantity} ={" "}
                      <span className="font-bold">
                        {formatUSD(item.quantity * item.productVariant.price)}
                      </span>
                    </p>
                    {item.quantity >= item.productVariant.stock_quantity && (
                      <p className="text-xs text-destructive font-medium">
                        Maximum stock reached (
                        {item.productVariant.stock_quantity})
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls and Delete Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:items-end">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity,
                            -1,
                            item.productVariant.stock_quantity
                          )
                        }
                        disabled={item.quantity <= 1 || isUpdating}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity,
                            1,
                            item.productVariant.stock_quantity
                          )
                        }
                        disabled={
                          item.quantity >= item.productVariant.stock_quantity ||
                          isUpdating
                        }
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteItem(
                          item.id,
                          item.productVariant.product.name
                        )
                      }
                      disabled={isDeleting}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 shadow-lg">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-3">Order Summary</h2>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({totals.itemCount} items)</span>
                  <span>{formatUSD(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold">{formatUSD(totals.subtotal)}</span>
              </div>
              <Button
                className="w-full"
                asChild
                disabled={selectedItems.length === 0}
              >
                <Link href="/checkout" className="gap-2">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
