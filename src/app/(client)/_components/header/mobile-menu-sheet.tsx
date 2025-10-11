import ThemeToggle from "@/components/global/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { User } from "@/queries/client/users/types";
import { X, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";

interface MobileMenuSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function MobileMenuSheet({
  isOpen,
  onOpenChange,
  user,
}: MobileMenuSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 border" showX={false}>
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border rounded flex items-center justify-center">
                <span className="font-semibold text-xs">S</span>
              </div>
              <SheetTitle className="text-lg">Shop</SheetTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="space-y-2">
          <nav className="space-y-1">
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start h-12 text-left"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/cart">
                <ShoppingCart className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">
                    Carts ({user?.cart?._count.items || 0})
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track & manage carts
                  </p>
                </div>
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start h-12 text-left"
              onClick={() => onOpenChange(false)}
            >
              <Link href="/wishlist">
                <Heart className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-medium">
                    Wishlist ({user?._count.wishlists || 0})
                  </div>
                  <p className="text-xs text-muted-foreground">Saved items</p>
                </div>
              </Link>
            </Button>
          </nav>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between p-3">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
