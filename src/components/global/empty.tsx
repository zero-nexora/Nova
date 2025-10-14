"use client";

import { Card, CardContent } from "../ui/card";
import { ShoppingBag } from "lucide-react";

export const Empty = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <ShoppingBag className="w-12 h-12 mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">No data available.</h2>
        <p className="text-sm mb-6 text-muted-foreground">
          This section will show results once data becomes available.
        </p>
      </CardContent>
    </Card>
  </div>
);
