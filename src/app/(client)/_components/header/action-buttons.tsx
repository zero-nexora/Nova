import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { User } from "@/queries/client/users/types";
import { UserButtonCustom } from "@/components/global/user-button-custom";
import ThemeToggle from "@/components/global/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

interface ActionButtonsProps {
  user: User | null;
}

export function ActionButtons({ user }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="relative h-10 w-10 hidden sm:flex"
        >
          <Link href="/wishlist">
            <Heart className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-0">
              {user?._count.wishlists || 0}
            </Badge>
            <span className="sr-only">Wishlist</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="relative h-10 w-10 hidden sm:flex"
        >
          <Link href="/cart">
            <ShoppingCart className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-0">
              {user?.cart?._count.items || 0}
            </Badge>
            <span className="sr-only">Shopping Cart</span>
          </Link>
        </Button>
        <UserButtonCustom />
      </SignedIn>
      <SignedOut>
        <Button size="sm" asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/sign-in">Login</Link>
        </Button>
      </SignedOut>
      <ThemeToggle />
    </div>
  );
}

export function ActionButtonsSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-8 rounded-md hidden sm:block" />
      <Skeleton className="h-8 w-8 rounded-md hidden sm:block" />
      <Skeleton className="h-8 w-8 hidden sm:block rounded-full" />
      <ThemeToggle />
    </div>
  );
}
