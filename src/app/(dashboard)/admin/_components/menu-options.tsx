"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import clsx from "clsx";
import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface MenuOptionsProps {
  defaultOpen: boolean;
}

export const MenuOptions = ({ defaultOpen }: MenuOptionsProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:hidden flex"
      >
        <Button variant={"outline"} size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showX={!defaultOpen}
        className={clsx(
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
          {
            "hidden md:inline-block z-0 w-[300px]": defaultOpen,
            "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <SheetHeader className="hidden">
          <SheetTitle className="sr-only">Menu Options</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
