"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/stores/confirm-store";
import { AlertTriangle, Trash2, AlertCircle } from "lucide-react";
import { Loading } from "../global/loading";

export const CustomConfirm = () => {
  const { isOpen, data, confirm, cancel } = useConfirm();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await confirm();
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (data?.icon) return data.icon;

    switch (data?.variant) {
      case "destructive":
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
    }
  };

  const getButtonVariant = () => {
    switch (data?.variant) {
      case "destructive":
        return "destructive";
      case "warning":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={cancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {data?.title}
              </DialogTitle>
              {data?.description && (
                <DialogDescription className="mt-2">
                  {data.description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={cancel} disabled={isLoading}>
            {data?.cancelText || "Cancel"}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loading /> : data?.confirmText || "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
