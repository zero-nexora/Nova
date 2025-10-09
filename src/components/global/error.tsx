"use client";

import { Button } from "../ui/button";
import { XCircle, Home } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const Error = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <XCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          We encountered an error. Please try again later
        </p>
        <Button variant="outline">
          <span className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Go Home
          </span>
        </Button>
      </CardContent>
    </Card>
  </div>
);
