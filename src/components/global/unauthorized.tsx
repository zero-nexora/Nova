"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Home, LogIn, ShieldAlert } from "lucide-react";

export const Unauthorized = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <ShieldAlert className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          You don&apos;t have permission to access this page
        </p>
        <div className="flex gap-3">
          <Button variant="outline">
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Go Home
            </span>
          </Button>
          <Link href={"/sign-in"}>
            <Button>
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>
);
