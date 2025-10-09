"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";

export const Empty = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <ShoppingBag className="w-12 h-12 mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add some products to get started
        </p>
        <Link href={"/"}>
          <Button>
            <span className="flex items-center gap-2">
              Shop Now <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);
