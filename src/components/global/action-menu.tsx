"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Edit, Trash, Eye, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionMenuProps {
  onUpdate?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  onView?: () => void;
}

export const ActionMenu = ({
  onUpdate,
  onDelete,
  onView,
  onToggle,
}: ActionMenuProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
        )}
        {onUpdate && (
          <DropdownMenuItem onClick={onUpdate}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
        )}
        {onToggle && (
          <DropdownMenuItem onClick={onToggle}>
            <RotateCcw className="mr-2 h-4 w-4" /> Toggle
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-red-500">
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
