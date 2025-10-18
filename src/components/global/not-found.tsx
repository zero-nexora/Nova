"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { AlertCircle, Home } from "lucide-react";

export const NotFound = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Not Found</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Oops! Nothing to display here.
        </p>
        <Link href={"/"}>
          <Button>
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Back to Home
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);
