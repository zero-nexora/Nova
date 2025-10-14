"use client";

import clsx from "clsx";
import Link from "next/link";
import { cn, restrictSidebarRoutes } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Logo } from "@/components/global/logo";
import { useUserStore } from "@/stores/client/user-store";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MenuOptionsProps {
  defaultOpen: boolean;
}

export const MenuOptions = ({ defaultOpen }: MenuOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  const filteredRoutes = useMemo(() => restrictSidebarRoutes(user), [user]);

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
        <Button variant="outline" size="icon" className="rounded-xl shadow-md">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        showX={!defaultOpen}
        className={clsx(
          "bg-background/90 backdrop-blur-xl fixed top-0 border-r p-6 flex flex-col",
          {
            "hidden md:flex md:flex-col z-0 w-[300px]": defaultOpen,
            "flex md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <SheetHeader className="pb-4 border-b flex items-center">
          <SheetTitle className="text-xl font-bold tracking-tight">
            <Logo />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 py-4">
          <Command className="rounded-lg bg-background/60 shadow-sm h-full flex flex-col">
            <CommandInput placeholder="Search menu..." className="h-10" />
            <CommandList className="flex-1">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No menu items found.
              </CommandEmpty>

              <ScrollArea className="h-[500px]">
                <CommandGroup heading="Navigation" className="px-2">
                  {filteredRoutes.map((route) => {
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
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isActive &&
                              "bg-primary text-primary-foreground shadow-md"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {route.icon && (
                            <route.icon
                              className={cn(
                                "h-5 w-5 transition-colors",
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
              </ScrollArea>
            </CommandList>
          </Command>
        </div>
      </SheetContent>
    </Sheet>
  );
};
