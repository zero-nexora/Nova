"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { XCircle, Home } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const Error = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <XCircle className="w-12 h-12 mb-4 text-destructive" />
        <h2 className="text-xl font-semibold mb-2">
          Oops, Something Went Wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          An unexpected error occurred. Please try again later or contact
          support if the issue persists.
        </p>
        <Link href={"/"}>
          <Button variant="outline">
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Go Home
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  </div>
);
