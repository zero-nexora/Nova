"use client";

import { useMemo, useState } from "react";
import { Empty } from "@/components/global/empty";
import { useGetCart } from "../hooks/use-get-cart";
import { OrderSummary } from "./order-summary";
import { CartItem } from "./cart-item";
import { CartHeader } from "./cart-header";

export const CartView = () => {
  const { cart, isPending } = useGetCart();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
    if (!cart?.items.length) return { subtotal: 0, itemCount: 0 };

    return cart.items.reduce(
      (acc, item) => {
        if (selectedItems.includes(item.id)) {
          acc.subtotal += item.quantity * item.productVariant.price;
          acc.itemCount += item.quantity;
        }
        return acc;
      },
      { subtotal: 0, itemCount: 0 }
    );
  }, [cart, selectedItems]);

  if (!cart || !cart.items.length) {
    return <Empty />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
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
