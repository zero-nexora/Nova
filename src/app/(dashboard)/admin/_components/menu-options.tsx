"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarRoutes } from "@/lib/constants";
import clsx from "clsx";
import { Menu } from "lucide-react";
import Link from "next/link";
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
        <SheetHeader>
          <SheetTitle className="sr-only" />
        </SheetHeader>
        <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
        <Separator className="mb-4" />
        <nav className="relative">
          <Command className="rounded-lg overflow-visible bg-transparent">
            <CommandInput placeholder="Search..." />
            <CommandList className="py-4 overflow-visible">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="overflow-visible">
                {sidebarRoutes.map((route) => (
                  <CommandItem key={route.path} className="w-full md:w-[320px]">
                    <Link
                      href={route.path}
                      className="flex items-center gap-2  rounded-md transition-all w-[320px] md:w-full"
                    >
                      {route.icon && <route.icon className="h-4 w-4" />}
                      {route.label}
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
