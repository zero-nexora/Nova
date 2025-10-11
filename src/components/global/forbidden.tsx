"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Home, Lock, LogIn } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export const Forbidden = () => (
  <div className="container mx-auto px-4 py-8">
    <Card className="max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12">
        <Lock className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          You do not have permission to access this page. Please contact the
          administrator.
        </p>
        <div className="flex gap-3">
          <Link href={"/"}>
            <Button variant="outline">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Go Home
              </span>
            </Button>
          </Link>
          <Link href={"/contact-admin"}>
            <Button>
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Contact Admin
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </div>
);
