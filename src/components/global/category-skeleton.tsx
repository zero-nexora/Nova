"use client";

import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

export const CategoryListSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Skeleton for Categories List */}
      <div className="space-y-3">
        <Accordion type="multiple" className="w-full">
          {[...Array(3)].map((_, index) => (
            <AccordionItem key={index} value={`skeleton-${index}`}>
              <div className="bg-muted/10 rounded-md">
                <AccordionTrigger className="p-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-5">
                      <Checkbox disabled className="opacity-50" />

                      {/* Skeleton for Category Image */}
                      <Skeleton className="w-14 h-14 rounded-xl" />

                      {/* Skeleton for Category Info */}
                      <div className="flex flex-col items-start space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md">
                          <Hash className="w-3.5 h-3.5 opacity-50" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Skeleton for Status Badge */}
                      <Skeleton className="h-7 w-20 rounded-full" />

                      {/* Skeleton for Action Menu */}
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  {/* Skeleton for Subcategory List */}
                  <div className="space-y-2">
                    {[...Array(2)].map((_, subIndex) => (
                      <div key={subIndex} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
