"use client";

import { useEffect, useMemo, useState } from "react";
import { Empty } from "@/components/global/empty";
import { useGetCart } from "../hooks/use-get-cart";
import { OrderSummary, OrderSummarySkeleton } from "./order-summary";
import { CartItem, CartItemSkeleton } from "./cart-item";
import { CartHeader, CartHeaderSkeleton } from "./cart-header";
import { useCartStore } from "@/stores/client/carts-store";
import { Error } from "@/components/global/error";

export const CartView = () => {
  const { cart, error } = useGetCart();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { setCart, clearCart, cart: cartState } = useCartStore();

  useEffect(() => {
    if (cart) setCart(cart);
    else clearCart();
  }, [cart]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cart?.items.map((item) => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const totals = useMemo(() => {
    if (!cartState?.items.length) return { subtotal: 0, itemCount: 0 };

    return cartState.items.reduce(
      (acc, item) => {
        if (selectedItems.includes(item.id)) {
          acc.subtotal += item.quantity * item.productVariant.price;
          acc.itemCount += item.quantity;
        }
        return acc;
      },
      { subtotal: 0, itemCount: 0 }
    );
  }, [cartState, selectedItems]);

  if (error) return <Error />;

  if (!cart || !cart.items.length) return <Empty />;

  return (
    <div>
      <CartHeader
        cart={cart}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onSelectItem={handleSelectItem}
            />
          ))}
        </div>
        <OrderSummary totals={totals} selectedItems={selectedItems} />
      </div>
    </div>
  );
};

export const CartViewSkeleton = () => {
  return (
    <div>
      <CartHeaderSkeleton />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(4)].map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </div>
        <OrderSummarySkeleton />
      </div>
    </div>
  );
};
