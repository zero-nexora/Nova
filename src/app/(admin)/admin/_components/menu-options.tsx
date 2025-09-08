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
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface MenuOptionsProps {
  defaultOpen: boolean;
}

export const MenuOptions = ({ defaultOpen }: MenuOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!isMounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false} {...openState}>
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
        <SheetHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <SheetTitle className="text-lg font-semibold">Dashboard</SheetTitle>
        </SheetHeader>

        <Separator className="mx-4" />

        <div className="flex-1 overflow-hidden p-4">
          <div className="mb-4">
            <Command className="rounded-lg  bg-background/50 border-none">
              <CommandInput placeholder="Search menu..." className="h-10" />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No menu items found.
                </CommandEmpty>

                <CommandGroup heading="Navigation" className="p-2">
                  {sidebarRoutes.map((route) => {
                    const isActive = pathname === route.path;

                    return (
                      <CommandItem
                        key={route.path}
                        value={route.label}
                        className="p-0"
                      >
                        <Link
                          href={route.path}
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                            "hover:bg-accent/80 hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            isActive &&
                              "bg-primary text-primary-foreground shadow-sm"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {route.icon && (
                            <route.icon
                              className={cn(
                                "h-4 w-4 transition-colors",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              )}
                            />
                          )}
                          <span>{route.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/80" />
                          )}
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
