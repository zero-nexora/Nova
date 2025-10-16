import Link from "next/link";
import { formatUSD } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSummaryProps {
  totals: { subtotal: number; itemCount: number };
  selectedItems: string[];
}

export const OrderSummary = ({ totals, selectedItems }: OrderSummaryProps) => {
  return (
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
  );
};

export const OrderSummarySkeleton = () => {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-4 shadow-lg flex flex-col gap-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};
