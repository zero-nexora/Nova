import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatUSD } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="sticky top-4 shadow-lg p-4">
        <Skeleton className="h-6 w-1/3 mb-3" />
        <div className="space-y-2 mb-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-[1px] w-full my-3" />
        <div className="flex justify-between mb-4">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};
